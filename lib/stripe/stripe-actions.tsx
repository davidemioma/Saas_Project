"use server";

import Stripe from "stripe";
import { stripe } from "./index";
import prismadb from "../prisma";

export const onSubscriptionCreated = async ({
  subscription,
  customerId,
}: {
  subscription: Stripe.Subscription;
  customerId: string;
}) => {
  try {
    const agency = await prismadb.agency.findFirst({
      where: {
        customerId,
      },
      include: {
        subAccounts: true,
      },
    });

    if (!agency) {
      throw new Error("Could not find agency");
    }

    const data = {
      customerId,
      agencyId: agency.id,
      active: subscription.status === "active",
      currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
      //@ts-ignore
      priceId: subscription.plan.id,
      subscritiptionId: subscription.id,
      //@ts-ignore
      plan: subscription.plan.id,
    };

    //Save subscription to database
    await prismadb.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      create: data,
      update: data,
    });
  } catch (err) {
    console.log("ON_STRIPE_SUBSCRIPTION_CREATED", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const getConnectAccountProducts = async (stripeAccount: string) => {
  try {
    if (!stripeAccount) {
      return [];
    }

    const products = await stripe.products.list(
      {
        limit: 50,
        expand: ["data.default_price"],
      },
      {
        stripeAccount,
      }
    );

    return products.data;
  } catch (err) {
    console.log("GET_STRIPE_ACCOUNT_PRODUCT", err);

    return [];
  }
};
