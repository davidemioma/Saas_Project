import prismadb from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatCharges } from "@/lib/utils";
import { columns } from "./_components/Columns";
import PricingCard from "./_components/PricingCard";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { addOnProducts, pricingCards } from "@/lib/constants";
import SubscriptionHelper from "./_components/SubscriptionHelper";

export default async function BillingPage({
  params: { agencyId },
}: {
  params: { agencyId: string };
}) {
  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ["data.default_price"],
  });

  //Check if current agency has a subscription
  const agency = await prismadb.agency.findUnique({
    where: {
      id: agencyId,
    },
    select: {
      subscription: {
        select: {
          priceId: true,
          active: true,
          plan: true,
          customerId: true,
        },
      },
      customerId: true,
    },
  });

  //Load all product prices from stripe
  const prices = await stripe.prices.list({
    product: process.env.NEXT_PLURA_PRODUCT_ID,
    active: true,
  });

  //Get price details
  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agency?.subscription?.priceId,
  );

  //Get some charges from stripe just to display it
  const charges = await stripe.charges.list({
    limit: 50,
    customer: agency?.customerId || "",
  });

  const allCharges = formatCharges(charges);

  return (
    <>
      <SubscriptionHelper
        prices={prices.data}
        customerId={agency?.customerId || ""}
        active={agency?.subscription?.active === true}
      />

      <h1 className="p-4 text-4xl">Billing</h1>

      <Separator />

      <h2 className="p-4 text-2xl">Current Plan</h2>

      <div className="grid gap-8 lg:grid-cols-2 2xl:grid-cols-3">
        <PricingCard
          planExists={agency?.subscription?.active || false}
          customerId={agency?.customerId || ""}
          prices={prices.data}
          plan={agency?.subscription?.plan || undefined}
          features={
            agency?.subscription?.active
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === "Starter")
                  ?.features ||
                []
          }
          title={
            agency?.subscription?.active === true
              ? currentPlanDetails?.title || "Starter"
              : "Starter"
          }
          duration="/ month"
          description={
            agency?.subscription?.active
              ? currentPlanDetails?.description || "Lets get started"
              : "Lets get started! Pick a plan that works best for you."
          }
          highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support@plura-app.com"
          highlightTitle="Plan Options"
          buttonText={
            agency?.subscription?.active === true
              ? "Change Plan"
              : "Get Started"
          }
          amt={
            agency?.subscription?.active === true
              ? currentPlanDetails?.price || "$0"
              : "$0"
          }
        />

        {/* {addOns.data.map((addOn) => (
          <PricingCard
            key={addOn.id}
            planExists={addOn?.active === true}
            prices={prices.data}
            customerId={agency?.customerId || ""}
            buttonText="Subscribe"
            description="Dedicated support line & teams channel for support"
            duration="/ month"
            features={[]}
            title={"24/7 priority support"}
            highlightTitle="Get support now!"
            highlightDescription="Get priority support and skip the long long with the click of a button."
            amt={
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                  `$${addOn.default_price.unit_amount / 100}`
                : "$0"
            }
          />
        ))} */}
      </div>

      <h2 className="p-4 pt-10 text-2xl">Payment History</h2>

      <DataTable filterValue="id" data={allCharges} columns={columns} />
    </>
  );
}
