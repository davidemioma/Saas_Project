import React from "react";
import { v4 } from "uuid";
import { cn } from "@/lib/utils";
import Recursive from "./Recursive";
import { Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditorBtns, defaultStyles } from "@/lib/constants";
import { useEditor } from "@/providers/editor/editor-provider";
import { EditorElement } from "@/providers/editor/editor-reducer";

type Props = {
  element: EditorElement;
};

const Container = ({ element }: Props) => {
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

  const onDragStart = ({ e, type }: { e: React.DragEvent; type: string }) => {
    if (type === "__body") return;

    e.dataTransfer.setData("componentType", type);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.stopPropagation();

    const componentType = e.dataTransfer.getData("componentType") as EditorBtns;

    switch (componentType) {
      case "text":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: element.id,
            elementDetails: {
              id: v4(),
              name: "Text",
              type: "text",
              styles: {
                color: "black",
                ...defaultStyles,
              },
              content: { innerText: "Text Element" },
            },
          },
        });
        break;
      case "link":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: element.id,
            elementDetails: {
              id: v4(),
              name: "Link",
              type: "link",
              styles: {
                color: "black",
                ...defaultStyles,
              },
              content: { innerText: "Link Element", href: "#" },
            },
          },
        });
        break;
      case "video":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: element.id,
            elementDetails: {
              id: v4(),
              name: "Video",
              type: "video",
              styles: {},
              content: {
                src: "https://www.youtube.com/embed/A3l6YYkXzzg?si=zbcCeWcpq7Cwf8W1",
              },
            },
          },
        });
        break;
      case "container":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: element.id,
            elementDetails: {
              id: v4(),
              name: "Container",
              type: "container",
              styles: {
                ...defaultStyles,
              },
              content: [],
            },
          },
        });
        break;
      case "contactForm":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: element.id,
            elementDetails: {
              id: v4(),
              name: "Contact Form",
              type: "contactForm",
              styles: {},
              content: [],
            },
          },
        });
        break;
      case "paymentForm":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: element.id,
            elementDetails: {
              id: v4(),
              name: "Payment Form",
              type: "paymentForm",
              styles: {},
              content: [],
            },
          },
        });
        break;
      case "2Col":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: element.id,
            elementDetails: {
              id: v4(),
              name: "Two Columns",
              type: "2Col",
              styles: { ...defaultStyles, display: "flex" },
              content: [
                {
                  id: v4(),
                  name: "Container",
                  type: "container",
                  styles: {
                    width: "100%",
                    ...defaultStyles,
                  },
                  content: [],
                },
                {
                  id: v4(),
                  name: "Container",
                  type: "container",
                  styles: {
                    width: "100%",
                    ...defaultStyles,
                  },
                  content: [],
                },
              ],
            },
          },
        });
        break;
      case "3Col":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: element.id,
            elementDetails: {
              id: v4(),
              name: "Three Columns",
              type: "3Col",
              styles: { display: "grid", ...defaultStyles },
              content: [
                {
                  id: v4(),
                  name: "Container",
                  type: "container",
                  styles: {
                    width: "100%",
                    ...defaultStyles,
                  },
                  content: [],
                },
                {
                  id: v4(),
                  name: "Container",
                  type: "container",
                  styles: {
                    width: "100%",
                    ...defaultStyles,
                  },
                  content: [],
                },
                {
                  id: v4(),
                  name: "Container",
                  type: "container",
                  styles: {
                    width: "100%",
                    ...defaultStyles,
                  },
                  content: [],
                },
              ],
            },
          },
        });
        break;
      default:
    }
  };

  return (
    <div
      style={element.styles}
      className={cn(
        "group relative p-4 transition-all",
        (element.type === "container" ||
          element.type === "2Col" ||
          element.type === "3Col") &&
          "w-full max-w-full",
        element.type === "container" && "h-fit",
        element.type === "__body" && "h-full overflow-scroll",
        element.type === "2Col" && "flex flex-col md:flex-row",
        element.type === "3Col" && "grid md:grid-cols-2 lg:grid-cols-3",
        state.editor.selectedElement.id === element.id &&
          !state.editor.liveMode &&
          state.editor.selectedElement.type !== "__body" &&
          "border-blue-500",
        state.editor.selectedElement.id === element.id &&
          !state.editor.liveMode &&
          state.editor.selectedElement.type === "__body" &&
          "border-4 border-yellow-400",
        state.editor.selectedElement.id === element.id &&
          !state.editor.liveMode &&
          "border-solid",
        !state.editor.liveMode && "border-[1px] border-dashed border-slate-300",
      )}
      draggable={element.type !== "__body"}
      onDragStart={(e) => onDragStart({ e, type: "container" })}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onBodyClicked}
    >
      <Badge
        className={cn(
          "absolute -left-[1px] -top-[23px] hidden rounded-none rounded-t-lg",
          state.editor.selectedElement.id === element.id &&
            !state.editor.liveMode &&
            "block",
        )}
      >
        {element.name}
      </Badge>

      {Array.isArray(element.content) &&
        element.content.map((element) => (
          <Recursive key={element.id} element={element} />
        ))}

      {state.editor.selectedElement.id === element.id &&
        !state.editor.liveMode &&
        state.editor.selectedElement.type !== "__body" && (
          <div className="absolute -right-[1px] -top-[25px] rounded-none rounded-t-lg bg-primary px-2.5 py-1 text-xs font-bold">
            <Trash size={16} onClick={onDeleteElement} />
          </div>
        )}
    </div>
  );
};

export default Container;
