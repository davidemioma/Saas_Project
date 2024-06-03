import React from "react";
import { Link2Icon } from "lucide-react";
import { EditorBtns } from "@/lib/constants";

const LinkPlaceholder = () => {
  const onDragState = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;

    e.dataTransfer.setData("componentType", type);
  };

  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted"
      draggable
      onDragStart={(e) => {
        onDragState(e, "link");
      }}
    >
      <Link2Icon size={40} className="text-muted-foreground" />
    </div>
  );
};

export default LinkPlaceholder;
