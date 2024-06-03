"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { EyeOff } from "lucide-react";
import Loader from "@/components/Loader";
import { getFunnelPage } from "@/data/queries";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Recursive from "./_editor-components/Recursive";
import { useEditor } from "@/providers/editor/editor-provider";

type Props = {
  subaccountId: string;
  funnelId: string;
  funnelPageId: string;
  liveMode?: boolean;
};

const FunnelEditor = ({
  subaccountId,
  funnelId,
  funnelPageId,
  liveMode,
}: Props) => {
  const { state, dispatch } = useEditor();

  useEffect(() => {
    if (liveMode) {
      dispatch({
        type: "TOGGLE_LIVE_MODE",
        payload: { value: true },
      });
    }
  }, [liveMode]);

  const {
    data: funnelPage,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-funnel-page", subaccountId, funnelId, funnelPageId],
    queryFn: async () => {
      const funnelPage = await getFunnelPage({
        subAccountId: subaccountId,
        funnelId,
        funnelPageId,
      });

      dispatch({
        type: "LOAD_DATA",
        payload: {
          elements: funnelPage?.content ? JSON.parse(funnelPage?.content) : "",
          withLive: !!liveMode,
        },
      });

      return funnelPage;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <span className="text-center text-lg font-medium">
          Could not get funnel page details! Please try again later.
        </span>
      </div>
    );
  }

  const handleClick = () => {
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {},
    });
  };

  const handlePreview = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });

    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };

  return (
    <div
      className={cn(
        "bg-background h-full overflow-scroll scrollbar-hide transition-all rounded-md use-automation-zoom-in",
        (state.editor.previewMode || state.editor.liveMode) && "p-0 mr-0",
        state.editor.device === "Desktop" && "w-full",
        state.editor.device === "Tablet" && "w-[90%]",
        state.editor.device === "Mobile" && "w-[420px]"
      )}
      onClick={handleClick}
    >
      {state.editor.previewMode && state.editor.liveMode && (
        <Button
          className="fixed top-0 left-0 z-[100] bg-slate-600 w-6 h-6 p-[2px]"
          variant={"ghost"}
          size={"icon"}
          onClick={handlePreview}
        >
          <EyeOff />
        </Button>
      )}

      {Array.isArray(state.editor.elements) &&
        state.editor.elements.map((element) => (
          <Recursive key={element.id} element={element} />
        ))}
    </div>
  );
};

export default FunnelEditor;
