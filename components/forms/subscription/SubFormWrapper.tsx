"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plan } from "@prisma/client";
import Loader from "@/components/Loader";
import { StripePriceList } from "@/types";
import { useRouter } from "next/navigation";
import { pricingCards } from "@/lib/constants";
import SubscriptionForm from "./SubscriptionForm";
import { Elements } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { getStripe } from "@/lib/stripe/stripe-client";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  customerId: string;
  planExists: boolean;
  plans?: {
    defaultPriceId?: Plan | undefined;
    prices: StripePriceList["data"];
  };
  onClose?: () => void;
};

type SubscriptionProps = {
  subscriptionId: string;
  clientSecret: string;
};

const SubFormWrapper = ({ customerId, planExists, plans, onClose }: Props) => {
  const router = useRouter();

  const [selectedPriceId, setSelectedPriceId] = useState<Plan | "">(
    plans?.defaultPriceId || ""
  );

  const [subscription, setSubscription] = useState<SubscriptionProps>({
    subscriptionId: "",
    clientSecret: "",
  });

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: "flat",
      },
    }),
    [subscription]
  );

  const { mutate: createSecret } = useMutation({
    mutationKey: ["create-subscription"],
    mutationFn: async () => {
      const res = await axios.post("/api/stripe/create-subscription", {
        customerId,
        priceId: selectedPriceId,
      });

      return res.data;
    },
    onSuccess: (data) => {
      setSubscription({
        clientSecret: data.clientSecret,
        subscriptionId: data.subscriptionId,
      });

      if (planExists) {
        toast.success("Your plan has been successfully upgraded!");

        onClose && onClose();
      }

      router.refresh();
    },
  });

  useEffect(() => {
    if (!selectedPriceId) return;

    createSecret();
  }, [customerId, selectedPriceId, plans]);

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {plans?.prices.map((price) => (
          <Card
            key={price.id}
            onClick={() => setSelectedPriceId(price.id as Plan)}
            className={cn(
              "relative cursor-pointer transition-all",
              selectedPriceId === price.id && "border-primary"
            )}
          >
            <CardHeader>
              <CardTitle>
                ${price.unit_amount ? price.unit_amount / 100 : "0"}
                <p className="text-sm text-muted-foreground">
                  {price.nickname}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    pricingCards.find((p) => p.priceId === price.id)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>

            {selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {options.clientSecret && !planExists && (
          <>
            <h1 className="text-xl">Payment Method</h1>

            <Elements stripe={getStripe()} options={options}>
              <SubscriptionForm
                selectedPriceId={selectedPriceId}
                onClose={onClose}
              />
            </Elements>
          </>
        )}

        {!options.clientSecret && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubFormWrapper;
