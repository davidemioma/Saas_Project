import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { onSubscriptionCreated } from "@/lib/stripe/stripe-actions";

const stripeWebhookEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: Request) {
  const body = await req.text();

  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.log("CREATE_EVENT_WEBHOOK_ERROR", error);

    return new NextResponse(`Webhook Error: ${error.message}`, {
      status: 400,
    });
  }

  try {
    if (stripeWebhookEvents.has(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;

      if (
        !subscription.metadata.connectAccountPayments &&
        !subscription.metadata.connectAccountSubscriptions
      ) {
        switch (event.type) {
          case "customer.subscription.created":
          case "customer.subscription.updated": {
            if (subscription.status === "active") {
              await onSubscriptionCreated({
                subscription,
                customerId: subscription.customer as string,
              });
            } else {
              console.log(
                "SKIPPED AT CREATED FROM WEBHOOK 💳 because subscription status is not active",
                subscription
              );

              break;
            }
          }
          default:
            console.log("👉🏻 Unhandled relevant event!", event.type);
        }
      } else {
        console.log(
          "SKIPPED FROM WEBHOOK 💳 because subscription was from a connected account not for the application",
          subscription
        );
      }
    }
  } catch (error: any) {
    console.log("WEBHOOK_ERROR", error);

    return new NextResponse(`Webhook Error: ${error.message}`, {
      status: 400,
    });
  }

  return new NextResponse(null, { status: 200 });
}
