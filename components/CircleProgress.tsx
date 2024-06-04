"use client";

import React from "react";
import { ProgressCircle } from "@tremor/react";

type Props = {
  value: number;
  description: React.ReactNode;
};

const CircleProgress = ({ value = 0, description }: Props) => {
  return (
    <div className="flex items-center gap-4">
      <ProgressCircle
        showAnimation={true}
        value={value}
        radius={70}
        strokeWidth={20}
      >
        {value}%
      </ProgressCircle>

      <div>
        <b>Closing Rate</b>

        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default CircleProgress;
