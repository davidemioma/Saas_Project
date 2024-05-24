import { stripe } from "@/lib/stripe";
import { addOnProducts } from "@/lib/constants";

export default async function BillingPage({
  params: { agencyId },
}: {
  params: { agencyId: string };
}) {
  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ["data.default_price"],
  });

  return <div>BillingPage</div>;
}
