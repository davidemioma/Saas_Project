"use client";

import React, { useState } from "react";
import { FunnelProps } from "@/types";
import { FunnelPage } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DragDropContext,
  DragStart,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Check } from "lucide-react";

type Props = {
  subaccountId: string;
  funnel: FunnelProps;
};

const FunnelSteps = ({ subaccountId, funnel }: Props) => {
  const [open, setOpen] = useState(false);

  const [funnelPagesState, setFunnelPagesState] = useState<FunnelPage[]>(
    funnel.funnelPages
  );

  const [clickedFunnelPage, setClickedFunnelPage] = useState<
    FunnelPage | undefined
  >(funnel.funnelPages[0]);

  const onDragStart = (e: DragStart) => {};

  const onDragEnd = (dropResult: DropResult) => {};

  return (
    <>
      <div className="flex flex-col lg:flex-row border">
        <aside className="flex-[0.3] bg-background flex flex-col justify-between p-6">
          <ScrollArea className="h-full">
            <div className="flex gap-4 items-center">
              <Check />
              Funnel Steps
            </div>

            {funnelPagesState.length > 0 ? (
              <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <Droppable
                  key="funnels"
                  droppableId="funnels"
                  direction="vertical"
                >
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {funnelPagesState.map((funnelPage) => (
                        <div
                          className="relative"
                          key={funnelPage.id}
                          onClick={() => setClickedFunnelPage(funnelPage)}
                        >
                          funnelPage
                        </div>
                      ))}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                No pages
              </div>
            )}
          </ScrollArea>
        </aside>
      </div>
    </>
  );
};

export default FunnelSteps;
