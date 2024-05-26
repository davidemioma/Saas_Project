"use client";

import React, { useState } from "react";
import { Plan } from "@prisma/client";
import { StripePriceList } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomModal from "@/components/modals/CustomModal";
import SubFormWrapper from "@/components/forms/subscription/SubFormWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  planExists: boolean;
  customerId: string;
  prices: StripePriceList["data"];
  features: string[];
  title: string;
  duration: string;
  description: string;
  highlightTitle: string;
  highlightDescription: string;
  buttonText: string;
  amt: string;
  plan?: Plan | undefined;
};

const PricingCard = ({
  planExists,
  customerId,
  features,
  prices,
  title,
  duration,
  description,
  highlightTitle,
  highlightDescription,
  buttonText,
  amt,
  plan,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CustomModal
        open={open}
        onOpenChange={() => setOpen(false)}
        title={"Manage Your Plan"}
        subheading="You can change your plan at any time from the billings settings"
      >
        <div className="h-[70vh]">
          <ScrollArea>
            <SubFormWrapper
              customerId={customerId}
              planExists={planExists}
              plans={{
                defaultPriceId: plan ? plan : undefined,
                prices,
              }}
              onClose={() => setOpen(false)}
            />
          </ScrollArea>
        </div>
      </CustomModal>

      <Card className="w-full flex flex-col justify-between">
        <CardHeader className="flex flex-col 2xl:flex-row 2xl:justify-between gap-5">
          <div className="space-y-2">
            <CardTitle>{title}</CardTitle>

            <CardDescription>{description}</CardDescription>
          </div>

          <p className="text-5xl font-bold">
            {amt}
            <small className="text-xs font-light text-muted-foreground">
              {duration}
            </small>
          </p>
        </CardHeader>

        <CardContent>
          <ul>
            {features.map((feature) => (
              <li
                key={feature}
                className="list-disc ml-4 text-muted-foreground"
              >
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <div className="w-full p-4 space-y-4 border rounded-lg">
            <div className="space-y-1">
              <p>{highlightTitle}</p>

              <p className="text-sm text-muted-foreground">
                {highlightDescription}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                className="w-full md:w-fit"
                onClick={() => setOpen(true)}
                disabled={!customerId}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default PricingCard;
