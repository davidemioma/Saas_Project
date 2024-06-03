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
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center px-4">
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
        "use-automation-zoom-in mr-[385px] h-full overflow-scroll rounded-md bg-gray-300 transition-all scrollbar-hide",
        (state.editor.previewMode || state.editor.liveMode) && "mr-0 p-0",
        state.editor.device === "Desktop" && "w-full",
        state.editor.device === "Tablet" && "w-[80%]",
        state.editor.device === "Mobile" && "w-[420px]",
      )}
      onClick={handleClick}
    >
      {state.editor.previewMode && state.editor.liveMode && (
        <Button
          className="fixed left-0 top-0 z-[100] h-6 w-6 bg-slate-600 p-[2px]"
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
