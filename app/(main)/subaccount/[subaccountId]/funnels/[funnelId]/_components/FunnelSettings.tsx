import React from "react";
import Stripe from "stripe";
import { FunnelProps } from "@/types";
import FunnelForm from "@/components/forms/FunnelForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FunnelProductsTable from "./FunnelProductsTable";

type Props = {
  subaccountId: string;
  funnel: FunnelProps;
  isConnected: boolean;
  products: Stripe.Product[];
};

const FunnelSettings = ({
  subaccountId,
  funnel,
  isConnected,
  products,
}: Props) => {
  return (
    <div className="grid xl:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Funnel Products</CardTitle>

          <CardDescription>
            Select the products and services you wish to sell on this funnel.
            You can sell one time and recurring products too.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <>
            {isConnected ? (
              <FunnelProductsTable funnel={funnel} products={products} />
            ) : (
              "Connect your stripe account to sell products."
            )}
          </>
        </CardContent>
      </Card>

      <FunnelForm subAccountId={subaccountId} defaultData={funnel} />

      <div className="h-20" />
    </div>
  );
};

export default FunnelSettings;
