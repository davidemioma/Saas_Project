"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  colorName: string;
  setSelectedColor?: (color: string) => void;
};

const TagColorsSelect = ({ colorName, title, setSelectedColor }: Props) => {
  return (
    <div
      key={colorName}
      className={cn("p-2 rounded-sm flex-shrink-0 text-xs cursor-pointer", {
        "bg-[#57acea]/10 text-[#57acea]": colorName === "BLUE",
        "bg-[#ffac7e]/10 text-[#ffac7e]": colorName === "ORANGE",
        "bg-rose-500/10 text-rose-500": colorName === "ROSE",
        "bg-emerald-400/10 text-emerald-400": colorName === "GREEN",
        "bg-purple-400/10 text-purple-400": colorName === "PURPLE",
        "border-[1px] border-[#57acea]": colorName === "BLUE" && !title,
        "border-[1px] border-[#ffac7e]": colorName === "ORANGE" && !title,
        "border-[1px] border-rose-500": colorName === "ROSE" && !title,
        "border-[1px] border-emerald-400": colorName === "GREEN" && !title,
        "border-[1px] border-purple-400": colorName === "PURPLE" && !title,
      })}
      onClick={() => {
        setSelectedColor && setSelectedColor(colorName);
      }}
    >
      {title}
    </div>
  );
};

export default TagColorsSelect;
