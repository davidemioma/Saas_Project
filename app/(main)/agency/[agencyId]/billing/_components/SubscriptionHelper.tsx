"use client";

import React, { useEffect, useState } from "react";
import { StripePriceList } from "@/types";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomModal from "@/components/modals/CustomModal";
import SubFormWrapper from "@/components/forms/subscription/SubFormWrapper";
import { Plan } from "@prisma/client";

type Props = {
  prices: StripePriceList["data"];
  customerId: string;
  active: boolean;
};

const SubscriptionHelper = ({ prices, customerId, active }: Props) => {
  const searchParams = useSearchParams();

  const plan = searchParams.get("plan");

  const [open, setOpen] = useState(false);

  const getPlan = (urlPlan: string | null) => {
    let plan: Plan | undefined = undefined;

    switch (urlPlan) {
      case "price_1PK5xrGFaQBujn7Dy3K9Gbaj":
        plan = Plan["price_1PK5xrGFaQBujn7Dy3K9Gbaj"];
      case "price_1PK5xrGFaQBujn7DJGJHGofQ":
        plan = Plan["price_1PK5xrGFaQBujn7DJGJHGofQ"];
      default:
        plan = undefined;
    }

    return plan;
  };

  useEffect(() => {
    if (plan) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [plan]);

  return (
    <>
      {open && (
        <CustomModal
          open={open}
          onOpenChange={() => setOpen(false)}
          title="Upgrade Plan!"
          subheading="Get started today to get access to premium features"
        >
          <div className="h-[70vh]">
            <ScrollArea>
              <SubFormWrapper
                customerId={customerId}
                planExists={active}
                plans={{
                  defaultPriceId: getPlan(plan),
                  prices,
                }}
                onClose={() => setOpen(false)}
              />
            </ScrollArea>
          </div>
        </CustomModal>
      )}
    </>
  );
};

export default SubscriptionHelper;
