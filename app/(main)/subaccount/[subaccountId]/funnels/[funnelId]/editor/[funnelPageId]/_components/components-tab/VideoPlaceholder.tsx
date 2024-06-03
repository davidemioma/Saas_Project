import React from "react";
import { Video } from "lucide-react";
import { EditorBtns } from "@/lib/constants";

const VideoPlaceholder = () => {
  const onDragState = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;

    e.dataTransfer.setData("componentType", type);
  };

  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted"
      draggable
      onDragStart={(e) => {
        onDragState(e, "video");
      }}
    >
      <Video size={40} className="text-muted-foreground" />
    </div>
  );
};

export default VideoPlaceholder;
