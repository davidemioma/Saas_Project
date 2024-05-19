"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import PipelineLane from "./PipelineLane";
import { Pipeline } from "@prisma/client";
import Flag from "@/components/icons/flag";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LaneProps, TicketProps } from "@/types";
import CreateLane from "@/components/forms/CreateLane";
import CustomModal from "@/components/modals/CustomModal";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";

type Props = {
  pipelineId: string;
  pipeline: Pipeline;
  subaccountId: string;
  lanes: LaneProps[];
};

const PipelineView = ({ pipelineId, pipeline, subaccountId, lanes }: Props) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [allLanes, setAllLanes] = useState<LaneProps[]>(lanes);

  useEffect(() => {
    setAllLanes(lanes);
  }, [lanes]);

  const lanesTickets: TicketProps[] = [];

  lanes.forEach((lane) => {
    lane.tickets.forEach((ticket) => {
      lanesTickets.push(ticket);
    });
  });

  const onUpdateLaneOrder = async () => {
    try {
      toast.success("Lanes Updated");

      router.refresh();
    } catch (err) {
      toast.error("Unable to re-order lanes!");
    }
  };

  const onTicketLaneOrder = async () => {
    try {
      toast.success("Tickets Updated");

      router.refresh();
    } catch (err) {
      toast.error("Unable to re-order tickets!");
    }
  };

  const onDragEnd = (result: DropResult) => {};

  return (
    <>
      <CustomModal
        open={open}
        onOpenChange={() => setOpen(false)}
        title=" Create A Lane"
        subheading="Lanes allow you to group tickets"
      >
        <CreateLane
          pipelineId={pipelineId}
          subAccountId={subaccountId}
          onClose={() => setOpen(false)}
        />
      </CustomModal>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="bg-white/60 dark:bg-background/60 p-4 rounded-xl use-automation-zoom-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl">{pipeline?.name}</h1>

            <Button
              className="flex items-center gap-4"
              onClick={() => setOpen(true)}
            >
              <Plus size={15} />
              Create Lane
            </Button>
          </div>

          {allLanes.length > 0 ? (
            <Droppable
              droppableId="lanes"
              key="lanes"
              type="lane"
              direction="horizontal"
            >
              {(provided) => (
                <div
                  className="flex item-center overflow-scroll scrollbar-hide"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="flex gap-5 mt-4">
                    {allLanes.map((lane, index) => (
                      <PipelineLane
                        key={lane.id}
                        index={index}
                        lane={lane}
                        pipelineId={pipelineId}
                        subaccountId={subaccountId}
                        lanesTickets={lanesTickets}
                      />
                    ))}

                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="opacity-100">
                <Flag width="100%" height="100%" />
              </div>

              <h2 className="text-lg text-center font-bold">
                No Lanes Available
              </h2>
            </div>
          )}
        </div>
      </DragDropContext>
    </>
  );
};

export default PipelineView;
