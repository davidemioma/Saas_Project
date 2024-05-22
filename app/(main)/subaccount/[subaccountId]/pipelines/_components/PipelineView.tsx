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
import { useMutation } from "@tanstack/react-query";
import CreateLane from "@/components/forms/CreateLane";
import CustomModal from "@/components/modals/CustomModal";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import { updateLaneOrder, updateTicketOrder } from "@/data/queries";

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

  const { mutate: onUpdateLaneOrder } = useMutation({
    mutationKey: ["update-lane", pipelineId],
    mutationFn: async (lanes: LaneProps[]) => {
      await updateLaneOrder({ pipelineId, lanes });
    },
    onSuccess: () => {
      toast.success("Lanes Updated");

      router.refresh();
    },
    onError: (err) => {
      toast.error("Unable to re-order lanes!");
    },
  });

  const { mutate: onUpdateTicketOrder } = useMutation({
    mutationKey: ["update-tickets", pipelineId],
    mutationFn: async (tickets: TicketProps[]) => {
      await updateTicketOrder({ pipelineId, tickets });
    },
    onSuccess: () => {
      toast.success("Tickets Updated");

      router.refresh();
    },
    onError: (err) => {
      toast.error("Unable to re-order tickets!");
    },
  });

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);

    const [removed] = result.splice(startIndex, 1);

    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    if (type === "lane") {
      const lanes = reorder(allLanes, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );

      setAllLanes(lanes);

      //Update backend
      onUpdateLaneOrder(lanes);
    }

    if (type === "ticket") {
      let newOrderedLanes = [...allLanes];

      // Source and destination lane spot
      const sourceLane = newOrderedLanes.find(
        (lane) => lane.id === source.droppableId
      );

      const destinationLane = newOrderedLanes.find(
        (lane) => lane.id === destination.droppableId
      );

      //Just reture if no lanes are available
      if (!sourceLane || !destinationLane) {
        return;
      }

      // Check if tickets exist in the source and destination lanes
      sourceLane.tickets = sourceLane.tickets || [];

      destinationLane.tickets = destinationLane.tickets || [];

      // Moving the ticket in the same lane
      if (source.droppableId === destination.droppableId) {
        const reorderedTickets = reorder(
          sourceLane.tickets,
          source.index,
          destination.index
        );

        reorderedTickets.forEach((ticket, idx) => {
          ticket.order = idx;
        });

        sourceLane.tickets = reorderedTickets;

        setAllLanes(newOrderedLanes);

        onUpdateTicketOrder(reorderedTickets);
      } else {
        // User moves the ticket to another lane
        // Remove ticket from the source lane
        const [movedTicket] = sourceLane.tickets.splice(source.index, 1);

        // Assign the new laneId to the moved card
        movedTicket.laneId = destination.droppableId;

        // Update the order for each ticket in the source lane
        sourceLane.tickets.forEach((ticket, idx) => {
          ticket.order = idx;
        });

        // Add ticket to the destination lane
        destinationLane.tickets.splice(destination.index, 0, movedTicket);

        // Update the order for each ticket in the destination lane
        destinationLane.tickets.forEach((ticket, idx) => {
          ticket.order = idx;
        });

        setAllLanes(newOrderedLanes);

        onUpdateTicketOrder(destinationLane.tickets);
      }
    }
  };

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
            <h1 className="text-xl sm:text-2xl">{pipeline?.name}</h1>

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
