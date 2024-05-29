"use client";

import { EditorBtns } from "@/lib/constants";
import { EditorAction } from "./editor-actions";

export type DeviceTypes = "Desktop" | "Mobile" | "Tablet";

export type EditorElement = {
  id: string;
  styles: React.CSSProperties;
  name: string;
  type: EditorBtns;
  content:
    | EditorElement[]
    | { href?: string; innerText?: string; src?: string };
};

export type Editor = {
  liveMode: boolean;
  elements: EditorElement[];
  selectedElement: EditorElement;
  device: DeviceTypes;
  previewMode: boolean;
  funnelPageId: string;
};

export type HistoryState = {
  history: Editor[];
  currentIndex: number;
};

export type EditorState = {
  editor: Editor;
  history: HistoryState;
};

const initialEditorState: Editor = {
  elements: [
    {
      content: [],
      id: "__body",
      name: "Body",
      styles: {},
      type: "__body",
    },
  ],
  selectedElement: {
    id: "",
    content: [],
    name: "",
    styles: {},
    type: null,
  },
  device: "Desktop",
  previewMode: false,
  liveMode: false,
  funnelPageId: "",
};

const initialHistoryState: HistoryState = {
  history: [initialEditorState],
  currentIndex: 0,
};

const initialState: EditorState = {
  editor: initialEditorState,
  history: initialHistoryState,
};

const addElement = ({
  elements,
  action,
}: {
  elements: EditorElement[];
  action: EditorAction;
}): EditorElement[] => {
  if (action.type !== "ADD_ELEMENT") {
    throw Error("Wrong action type!");
  }

  return elements.map((item) => {
    //Check if its an individual element or a child element
    if (item.id === action.payload.containerId && Array.isArray(item.content)) {
      return {
        ...item,
        content: [...item.content, action.payload.elementDetails],
      };
    } else if (item.content && Array.isArray(item.content)) {
      return {
        ...item,
        content: addElement({
          elements: item.content,
          action,
        }),
      };
    }
    return item;
  });
};

const updateElement = ({
  elements,
  action,
}: {
  elements: EditorElement[];
  action: EditorAction;
}): EditorElement[] => {
  if (action.type !== "UPDATE_ELEMENT") {
    throw Error("Wrong action type!");
  }

  return elements.map((item) => {
    if (item.id === action.payload.elementDetails.id) {
      return {
        ...item,
        ...action.payload.elementDetails,
      };
    } else if (item.content && Array.isArray(item.content)) {
      return {
        ...item,
        content: updateElement({
          elements: item.content,
          action,
        }),
      };
    }
    return item;
  });
};

const deleteElement = ({
  elements,
  action,
}: {
  elements: EditorElement[];
  action: EditorAction;
}): EditorElement[] => {
  if (action.type !== "DELETE_ELEMENT") {
    throw Error("Wrong action type!");
  }

  return elements.filter((item) => {
    if (item.id === action.payload.elementDetails.id) {
      return false;
    } else if (item.content && Array.isArray(item.content)) {
      item.content = deleteElement({ elements: item.content, action });
    }
    return true;
  });
};

const editorReducer = ({
  state = initialState,
  action,
}: {
  state: EditorState;
  action: EditorAction;
}): EditorState => {
  switch (action.type) {
    case "ADD_ELEMENT":
      const updatedEditorState = {
        ...state.editor,
        elements: addElement({ elements: state.editor.elements, action }),
      };

      //Update history
      const updatedHistory = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorState },
      ];

      const newEditorState = {
        ...state,
        editor: updatedEditorState,
        history: {
          ...state.history,
          history: updatedHistory,
          currentIndex: updatedHistory.length - 1,
        },
      };

      return newEditorState;
    case "UPDATE_ELEMENT":
      const UpdatedElementIsSelected =
        state.editor.selectedElement.id === action.payload.elementDetails.id;

      const updatedEditorStateWithUpdate = {
        ...state.editor,
        elements: updateElement({
          elements: state.editor.elements,
          action,
        }),
        selectedElement: UpdatedElementIsSelected
          ? action.payload.elementDetails
          : {
              id: "",
              content: [],
              name: "",
              styles: {},
              type: null,
            },
      };

      const updatedHistoryWithUpdate = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorStateWithUpdate },
      ];

      const newEditorStateWithUpdate = {
        ...state,
        editor: updatedEditorStateWithUpdate,
        history: {
          ...state.history,
          history: updatedHistoryWithUpdate,
          currentIndex: updatedHistoryWithUpdate.length - 1,
        },
      };

      return newEditorStateWithUpdate;
    case "DELETE_ELEMENT":
      const updatedEditorStateAfterDelete = {
        ...state.editor,
        elements: deleteElement({
          elements: state.editor.elements,
          action,
        }),
      };

      const updatedHistoryAfterDelete = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorStateAfterDelete },
      ];

      const newEditorStateAfterDelete = {
        ...state,
        editor: updatedEditorStateAfterDelete,
        history: {
          ...state.history,
          history: updatedHistoryAfterDelete,
          currentIndex: updatedHistoryAfterDelete.length - 1,
        },
      };

      return newEditorStateAfterDelete;
    case "CHANGE_CLICKED_ELEMENT":
      const clickedState = {
        ...state,
        editor: {
          ...state.editor,
          selectedElement: action.payload.elementDetails || {
            id: "",
            content: [],
            name: "",
            styles: {},
            type: null,
          },
        },
        history: {
          ...state.history,
          history: [
            ...state.history.history.slice(0, state.history.currentIndex + 1),
            { ...state.editor },
          ],
          currentIndex: state.history.currentIndex + 1,
        },
      };

      return clickedState;
    case "CHANGE_DEVICE":
      const changeDeviceState = {
        ...state,
        editor: {
          ...state.editor,
          device: action.payload.device,
        },
      };

      return changeDeviceState;
    case "TOGGLE_PREVIEW_MODE":
      const togglePreviewState = {
        ...state,
        editor: {
          ...state.editor,
          previewMode: !state.editor.previewMode,
        },
      };

      return togglePreviewState;
    case "TOGGLE_LIVE_MODE":
      const toggleLiveState = {
        ...state,
        editor: {
          ...state.editor,
          liveMode: action.payload
            ? action.payload.value
            : !state.editor.liveMode,
        },
      };

      return toggleLiveState;
    case "REDO":
      if (state.history.currentIndex < state.history.history.length) {
        const nextIndex = state.history.currentIndex + 1;

        const nextEditorState = { ...state.history.history[nextIndex] };

        const redoState = {
          ...state,
          editor: nextEditorState,
          history: {
            ...state.history,
            currentIndex: nextIndex,
          },
        };

        return redoState;
      }

      return state;
    case "UNDO":
      if (state.history.currentIndex > 0) {
        const prevIndex = state.history.currentIndex - 1;

        const prevEditorState = { ...state.history.history[prevIndex] };

        const undoState = {
          ...state,
          editor: prevEditorState,
          history: {
            ...state.history,
            currentIndex: prevIndex,
          },
        };

        return undoState;
      }

      return state;
    case "LOAD_DATA":
      return {
        ...initialState,
        editor: {
          ...initialState.editor,
          elements: action.payload.elements || initialEditorState.elements,
          liveMode: !!action.payload.withLive,
        },
      };
    case "SET_FUNNELPAGE_ID":
      const updatedEditorStateWithFunnelPageId = {
        ...state.editor,
        funnelPageId: action.payload.funnelPageId,
      };

      const updatedHistoryWithFunnelPageId = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorStateWithFunnelPageId },
      ];

      const funnelPageIdState = {
        ...state,
        editor: updatedEditorStateWithFunnelPageId,
        history: {
          ...state.history,
          history: updatedHistoryWithFunnelPageId,
          currentIndex: updatedHistoryWithFunnelPageId.length - 1,
        },
      };
      return funnelPageIdState;
    default:
      return state;
  }
};
