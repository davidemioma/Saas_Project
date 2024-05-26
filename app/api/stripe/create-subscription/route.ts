import prismadb from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    //Check if there is a current user
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse(
        "User must be logged in to perform this action.",
        { status: 401 }
      );
    }

    const body = await request.json();

    const { customerId, priceId } = body;

    if (!customerId) {
      return new NextResponse("Customer ID is missing", {
        status: 400,
      });
    }

    if (!priceId) {
      return new NextResponse("Price ID is missing", {
        status: 400,
      });
    }

    //Check if subscription exists
    const agency = await prismadb.agency.findFirst({
      where: {
        customerId,
      },
      select: {
        subscription: {
          select: {
            subscritiptionId: true,
            active: true,
          },
        },
      },
    });

    if (
      agency?.subscription?.subscritiptionId &&
      agency?.subscription?.active
    ) {
      //Update subscription
      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        agency?.subscription?.subscritiptionId
      );

      const subscription = await stripe.subscriptions.update(
        agency?.subscription?.subscritiptionId,
        {
          items: [
            {
              id: currentSubscriptionDetails.items.data[0].id,
              deleted: true,
            },
            { price: priceId },
          ],
          expand: ["latest_invoice.payment_intent"],
        }
      );

      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } else {
      //Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    }
  } catch (err) {
    console.log("[CHECKOUT_SUBSCRIPTION]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
