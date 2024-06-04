import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prisma";

type BodyProps = {
  subaccountId: string;
  subAccountConnectAccId: string;
  prices: { recurring: boolean; productId: string }[];
};

export async function POST(request: Request) {
  try {
    //Check if there is a current user
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse(
        "User must be logged in to perform this action.",
        { status: 401 },
      );
    }

    const body: BodyProps = await request.json();

    const { subaccountId, subAccountConnectAccId, prices } = body;

    if (!subAccountConnectAccId || !prices.length) {
      return new NextResponse("Stripe Account Id or price id is missing", {
        status: 400,
      });
    }

    if (
      !process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT ||
      !process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE ||
      !process.env.NEXT_PUBLIC_PLATFORM_AGENCY_PERCENT
    ) {
      return NextResponse.json({ error: "Stripe Fees do not exist" });
    }

    //Check if there are current subscriptions
    const subscriptionPriceExists = prices.find((price) => price.recurring);

    //Get the origin of the API url
    const origin = request.headers.get("origin");

    //Create stripe session
    const session = await stripe.checkout.sessions.create(
      {
        line_items: prices.map((price) => ({
          price: price.productId,
          quantity: 1,
        })),
        ...(subscriptionPriceExists && {
          subscription_data: {
            metadata: { connectAccountSubscriptions: "true" },
            application_fee_percent:
              +process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT,
          },
        }),
        ...(!subscriptionPriceExists && {
          payment_intent_data: {
            metadata: { connectAccountPayments: "true" },
            application_fee_amount:
              +process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE * 100,
          },
        }),
        mode: subscriptionPriceExists ? "subscription" : "payment",
        ui_mode: "embedded",
        redirect_on_completion: "never",
      },
      { stripeAccount: subAccountConnectAccId },
    );

    return NextResponse.json(
      { clientSecret: session.client_secret },
      {
        //Can be called on any page for stripe
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  } catch (err) {
    console.log("[CREATE_CHECKOUT_SESSION]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  const allowedOrigin = request.headers.get("origin");
  const response = new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
      "Access-Control-Max-Age": "86400",
    },
  });

  return response;
}
