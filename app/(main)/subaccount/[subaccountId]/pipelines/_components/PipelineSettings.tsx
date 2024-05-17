"use client";

import React from "react";
import { Pipeline } from "@prisma/client";
import CreatePipeline from "@/components/forms/CreatePipeline";

type Props = {
  pipeline: Pipeline;
  subaccountId: string;
};

const PipelineSettings = ({ pipeline, subaccountId }: Props) => {
  return (
    <CreatePipeline subAccountId={subaccountId} defaultPipeline={pipeline} />
  );
};

export default PipelineSettings;
