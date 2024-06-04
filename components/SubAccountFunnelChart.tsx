"use client";

import React from "react";
import { DonutChart } from "@tremor/react";

type Props = {
  data: {
    id: string;
    name: string;
    funnelPages: {
      name: string;
      visits: number;
    }[];
    totalFunnelVisits: number;
  }[];
};

const customTooltip = ({
  payload,
  active,
}: {
  payload: any;
  active: boolean;
}) => {
  if (!active || !payload) return null;

  const categoryPayload = payload?.[0];

  if (!categoryPayload) return null;

  return (
    <div className="ml-[100px] w-fit !rounded-lg bg-background/60 p-2 text-black shadow-2xl backdrop-blur-md dark:bg-muted/60 dark:text-white">
      <div className="flex flex-1 items-center space-x-2.5">
        <div
          className={`h-5 w-5 rounded-full bg-${categoryPayload?.color} rounded`}
        />
        <div className="w-full">
          <div className="flex items-center justify-between space-x-8">
            <p className="whitespace-nowrap text-right">
              {categoryPayload.name}
            </p>

            <p className="whitespace-nowrap text-right font-medium">
              {categoryPayload.value}
            </p>
          </div>
        </div>
      </div>

      {categoryPayload.payload.funnelPages?.map((page: any) => (
        <div
          key={page.id}
          className="flex items-center justify-between text-black dark:text-white/70"
        >
          <small>{page.name}</small>

          <small>{page.visits}</small>
        </div>
      ))}
    </div>
  );
};

const SubaccountFunnelChart = ({ data }: Props) => {
  return (
    <div className="flex h-fit items-start transition-all">
      <DonutChart
        className="h-40 w-40"
        data={data}
        category="totalFunnelVisits"
        index="name"
        colors={["blue-400", "primary", "blue-600", "blue-700", "blue-800"]}
        showAnimation={true}
        customTooltip={customTooltip}
        variant="pie"
      />
    </div>
  );
};

export default SubaccountFunnelChart;
