import React from "react";
import { EditorBtns } from "@/lib/constants";

const ContainerPlaceholder = () => {
  const onDragState = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;

    e.dataTransfer.setData("componentType", type);
  };

  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted/70 p-2"
      draggable
      onDragStart={(e) => {
        onDragState(e, "container");
      }}
    >
      <div className="h-full w-full rounded-sm border border-dashed border-muted-foreground/50 bg-muted" />
    </div>
  );
};

export default ContainerPlaceholder;
