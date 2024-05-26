"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Plan } from "@prisma/client";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type Props = {
  selectedPriceId: string | Plan;
  onClose?: () => void;
};

const SubscriptionForm = ({ selectedPriceId, onClose }: Props) => {
  const router = useRouter();

  const elements = useElements();

  const stripeHook = useStripe();

  const [priceError, setPriceError] = useState("");

  const { mutate: makePayment, isPending } = useMutation({
    mutationKey: ["make-payment"],
    mutationFn: async () => {
      setPriceError("");

      if (!selectedPriceId) {
        setPriceError("You need to select a plan to subscribe.");

        return;
      }

      if (!stripeHook || !elements) return;

      const { error } = await stripeHook.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/agency`,
        },
      });

      if (error) {
        toast.error(
          "We couldnt process your payment! Please try a different card"
        );

        return;
      }
    },
    onSuccess: (data) => {
      toast.success("Payment successfull!");

      onClose && onClose();

      router.refresh();
    },
    onError: (err) => {
      toast.error(
        "We couldnt process your payment! Please try a different card"
      );
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    makePayment();
  };

  return (
    <form onSubmit={onSubmit}>
      {priceError && <small className="text-destructive">{priceError}</small>}

      <div className="space-y-2 text-sm mb-5">
        <span className="text-lg font-bold">Test Card</span>

        <div className="flex">
          <span className="flex-1">Card Number</span>

          <span className="font-semibold">4242 4242 4242 4242</span>
        </div>

        <div className="flex">
          <span className="flex-1">Expiry Datae</span>

          <span className="font-semibold">04/26</span>
        </div>

        <div className="flex">
          <span className="flex-1">CVV</span>

          <span className="font-semibold">242</span>
        </div>
      </div>

      <PaymentElement />

      <Button disabled={!stripeHook || isPending} className="w-full mt-4">
        {isPending ? <Loader /> : "Submit"}
      </Button>
    </form>
  );
};

export default SubscriptionForm;
