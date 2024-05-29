"use client";

import { FunnelPage } from "@prisma/client";
import { EditorAction } from "./editor-actions";
import { Dispatch, createContext, useContext, useReducer } from "react";
import { EditorState, editorReducer, initialState } from "./editor-reducer";

type EditorContextProps = {
  subaccountId: string;
  funnelId: string;
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  pageDetails: FunnelPage | null;
};

type EditorProps = {
  children: React.ReactNode;
  subaccountId: string;
  funnelId: string;
  pageDetails: FunnelPage;
};

export const EditorContext = createContext<EditorContextProps>({
  subaccountId: "",
  funnelId: "",
  state: initialState,
  pageDetails: null,
  dispatch: () => undefined,
});

export const useEditor = () => {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("useEditor Hook must be used within the editor Provider");
  }

  return context;
};

const EditorProvider = ({
  children,
  subaccountId,
  funnelId,
  pageDetails,
}: EditorProps) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        subaccountId,
        funnelId,
        pageDetails,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
