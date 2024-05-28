"use client";

import React from "react";
import { FunnelPage } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { ArrowDown, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  index: number;
  isActive: boolean;
  funnelPage: FunnelPage;
};

const FunnelPageCard = ({ index, isActive, funnelPage }: Props) => {
  return (
    <Draggable draggableId={funnelPage.id} index={index}>
      {(provided) => (
        <Card
          className="relative my-2 p-0 cursor-grab"
          role="button"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <CardContent className="flex items-center gap-4 p-0">
            <div className="bg-muted h-14 w-14 flex items-center justify-center">
              <Mail />

              <ArrowDown
                size={18}
                className="absolute -bottom-2 text-primary"
              />
            </div>

            {funnelPage.name}
          </CardContent>

          {isActive && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
          )}
        </Card>
      )}
    </Draggable>
  );
};

export default FunnelPageCard;
