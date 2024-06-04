"use client";

import React, { useMemo, useState } from "react";
import Loader from "./Loader";
import { getPipelines } from "@/data/queries";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

type Props = {
  subaccountId: string;
};

const PipelineValue = ({ subaccountId }: Props) => {
  const [selectedPipelineId, setselectedPipelineId] = useState("");

  const [pipelineClosedValue, setPipelineClosedValue] = useState(0);

  const {
    data: pipelines,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-pipelines", subaccountId],
    queryFn: async () => {
      const pipelines = await getPipelines({ subAccountId: subaccountId });

      setselectedPipelineId(pipelines[0].id);

      return pipelines;
    },
  });

  const totalPipelineValue = useMemo(() => {
    if (pipelines?.length) {
      return (
        pipelines
          .find((pipeline) => pipeline.id === selectedPipelineId)
          ?.lanes?.reduce((totalLanes, lane, currentLaneIndex, array) => {
            const laneTicketsTotal = lane.tickets.reduce(
              (totalTickets, ticket) => totalTickets + Number(ticket?.value),
              0,
            );

            if (currentLaneIndex === array.length - 1) {
              setPipelineClosedValue(laneTicketsTotal || 0);

              return totalLanes;
            }

            return totalLanes + laneTicketsTotal;
          }, 0) || 0
      );
    }

    return 0;
  }, [selectedPipelineId, pipelines]);

  const pipelineRate = useMemo(
    () =>
      (pipelineClosedValue / (totalPipelineValue + pipelineClosedValue)) * 100,
    [pipelineClosedValue, totalPipelineValue],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Value</CardTitle>

        <small className="text-xs text-muted-foreground">
          Pipeline Progress
        </small>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Closed ${pipelineClosedValue}
          </span>

          <span className="text-xs text-muted-foreground">
            Total ${totalPipelineValue + pipelineClosedValue}
          </span>
        </div>

        <Progress className="h-2" color="green" value={pipelineRate} />
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        <p className="mb-2">
          Total value of all tickets in the given pipeline except the last lane.
          Your last lane is considered your closing lane in every pipeline.
        </p>

        <Select
          value={selectedPipelineId}
          onValueChange={setselectedPipelineId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a pipeline" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pipelines</SelectLabel>

              {isLoading && (
                <div className="flex w-full items-center justify-center p-4">
                  <Loader />
                </div>
              )}

              {isError && (
                <div className="flex w-full items-center justify-center p-4">
                  <span>Could not get piplines!</span>
                </div>
              )}

              {!isLoading &&
                !isError &&
                Array.isArray(pipelines) &&
                pipelines.map((pipeline) => (
                  <SelectItem value={pipeline.id} key={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default PipelineValue;
