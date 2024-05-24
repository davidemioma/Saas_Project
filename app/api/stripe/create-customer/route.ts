import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { StripeCustomerType } from "@/types";

export async function POST(request: Request) {
  try {
    //Check if there is a current user
    const { userId } = auth();

    if (!userId) {
      return new NextResponse(
        "User must be logged in to perform this action.",
        { status: 401 }
      );
    }

    const body: StripeCustomerType = await request.json();

    const { name, email, address, shipping } = body;

    if (!name || !email || !address || !shipping) {
      return new NextResponse("Bad request, Missing fields", {
        status: 400,
      });
    }

    const customer = await stripe.customers.create({
      email,
      name,
      address,
      shipping,
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (err) {
    console.log("[CHECKOUT_CUSTOMER]", err);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
