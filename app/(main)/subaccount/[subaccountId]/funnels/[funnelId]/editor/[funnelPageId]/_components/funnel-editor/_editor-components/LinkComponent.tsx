"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import { EditorBtns } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { useEditor } from "@/providers/editor/editor-provider";
import { EditorElement } from "@/providers/editor/editor-reducer";

type Props = {
  element: EditorElement;
};

const LinkComponent = ({ element }: Props) => {
  const { state, dispatch } = useEditor();

  const onBodyClicked = (e: React.MouseEvent) => {
    e.stopPropagation();

    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  const onDeleteElement = (e: React.MouseEvent) => {
    e.stopPropagation();

    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  const onDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;

    e.dataTransfer.setData("componentType", type);
  };

  return (
    <div
      style={element.styles}
      className={cn(
        "relative m-1 w-full p-0.5 text-[16px] transition-all",
        state.editor.selectedElement.id === element.id &&
          "border-solid border-blue-500",
        !state.editor.liveMode && "border border-dashed border-slate-300",
      )}
      draggable
      onDragStart={(e) => onDragStart(e, "link")}
      onClick={onBodyClicked}
    >
      {state.editor.selectedElement.id === element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -left-[1px] -top-[23px] rounded-none rounded-t-lg">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      {!Array.isArray(element.content) &&
        (state.editor.previewMode || state.editor.liveMode) && (
          <Link href={element.content.href || "#"}>
            {element.content.innerText}
          </Link>
        )}

      {!state.editor.liveMode && !state.editor.previewMode && (
        <span
          contentEditable={!state.editor.liveMode}
          onBlur={(e) => {
            const spanElement = e.target as HTMLSpanElement;

            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                elementDetails: {
                  ...element,
                  content: {
                    innerText: spanElement.innerText,
                  },
                },
              },
            });
          }}
        >
          {!Array.isArray(element.content) && element.content.innerText}
        </span>
      )}

      {state.editor.selectedElement.id === element.id &&
        !state.editor.liveMode && (
          <div className="absolute -right-[1px] -top-[25px] rounded-none rounded-t-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={onDeleteElement}
            />
          </div>
        )}
    </div>
  );
};

export default LinkComponent;
