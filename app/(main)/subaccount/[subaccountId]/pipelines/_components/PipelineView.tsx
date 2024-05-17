"use client";

import React from "react";
import { LaneProps } from "@/types";
import { Pipeline } from "@prisma/client";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";

type Props = {
  pipelineId: string;
  pipeline: Pipeline;
  subaccountId: string;
  lanes: LaneProps[];
};

const PipelineView = ({ pipelineId, pipeline, subaccountId, lanes }: Props) => {
  return <div>PipelineView</div>;
};

export default PipelineView;
