"use client";

import React, { useMemo, useState } from "react";
import { LaneProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import PipelineTicket from "./PipelineTicket";
import CreateLane from "@/components/forms/CreateLane";
import TicketForm from "@/components/forms/TicketForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import CustomModal from "@/components/modals/CustomModal";
import { Edit, MoreVertical, PlusCircleIcon, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  lane: LaneProps;
  index: number;
  pipelineId: string;
  subaccountId: string;
};

const PipelineLane = ({ lane, index, pipelineId, subaccountId }: Props) => {
  const [openEditLane, setOpenEditLane] = useState(false);

  const [openNewTicket, setOpenNewTicket] = useState(false);

  const amt = new Intl.NumberFormat("en-us", {
    style: "currency",
    currency: "USD",
  });

  //Getting the sum of all ticket value
  const laneAmt = useMemo(() => {
    return lane.tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    );
  }, [lane.tickets]);

  //Generating random color
  const randomColor = `#${Math.random().toString(16).slice(2, 8)}`;

  return (
    <>
      <CustomModal
        open={openNewTicket}
        onOpenChange={() => setOpenNewTicket(false)}
        title="Create A Ticket"
        subheading="Tickets are a great way to keep track of tasks"
      >
        <div className="h-[70vh]">
          <ScrollArea>
            <TicketForm
              laneId={lane.id}
              subaccountId={subaccountId}
              onClose={() => setOpenNewTicket(false)}
            />
          </ScrollArea>
        </div>
      </CustomModal>

      <CustomModal
        open={openEditLane}
        onOpenChange={() => setOpenEditLane(false)}
        title="Edit Lane Details"
        subheading=""
      >
        <CreateLane
          subAccountId={subaccountId}
          pipelineId={pipelineId}
          defaultLane={lane}
          onClose={() => setOpenEditLane(false)}
        />
      </CustomModal>

      <Draggable draggableId={lane.id} key={lane.id} index={index}>
        {(provided, snapshot) => {
          return (
            <div
              className="h-full"
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              <DropdownMenu>
                <div className="relative bg-slate-200/30 dark:bg-muted/40 h-[360px] md:h-[450px] w-[300px] rounded-lg overflow-y-scroll overflow-visible scrollbar-hide flex-shrink-0">
                  <div
                    {...provided.dragHandleProps}
                    className=" h-14 backdrop-blur-lg dark:bg-background/40 bg-slate-200/60 flex items-center justify-between gap-3"
                  >
                    <div className="h-full flex items-center p-4 justify-between cursor-grab border-b">
                      <div className="flex flex-1 items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ background: randomColor }}
                        />

                        <span className="font-bold text-sm">{lane.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Badge className="bg-white text-black">
                        {amt.format(laneAmt)}
                      </Badge>

                      <DropdownMenuTrigger>
                        <MoreVertical className="text-muted-foreground cursor-pointer" />
                      </DropdownMenuTrigger>
                    </div>
                  </div>

                  <Droppable droppableId={lane.id} key={lane.id} type="ticket">
                    {(provided) => (
                      <div className="w-full overflow-scroll py-2">
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="w-full p-2 space-y-2"
                        >
                          {lane.tickets.map((ticket, index) => (
                            <PipelineTicket
                              key={ticket.id}
                              index={index}
                              ticket={ticket}
                              subaccountId={subaccountId}
                              laneId={lane.id}
                            />
                          ))}

                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Options</DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => setOpenEditLane(true)}
                  >
                    <Trash size={15} />
                    Delete
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => setOpenEditLane(true)}
                  >
                    <Edit size={15} />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => setOpenNewTicket(true)}
                  >
                    <PlusCircleIcon size={15} />
                    Create Ticket
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }}
      </Draggable>
    </>
  );
};

export default PipelineLane;
