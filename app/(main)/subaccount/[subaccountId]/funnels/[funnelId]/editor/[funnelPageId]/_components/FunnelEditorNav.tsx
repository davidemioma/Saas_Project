"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FunnelPage } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { useEditor } from "@/providers/editor/editor-provider";
import { DeviceTypes } from "@/providers/editor/editor-reducer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createOrUpdateFunnelPage,
  updateFunnelPageContent,
} from "@/data/queries";
import {
  ArrowLeftCircle,
  Smartphone,
  Tablet,
  Laptop,
  EyeIcon,
  Undo2,
  Redo2,
} from "lucide-react";

type Props = {
  subaccountId: string;
  funnelId: string;
  funnelPage: FunnelPage;
};

const FunnelEditorNav = ({ subaccountId, funnelId, funnelPage }: Props) => {
  const router = useRouter();

  const { state, dispatch } = useEditor();

  const onUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const onRedo = () => {
    dispatch({ type: "REDO" });
  };

  const onPreviewClick = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });

    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };

  const { mutate: updateFunnelPageName, isPending } = useMutation({
    mutationKey: ["update-funnel-page", funnelPage.id],
    mutationFn: async (e: React.FocusEvent<HTMLInputElement, Element>) => {
      if (!e.target.value || e.target.value === funnelPage.name) return;

      await createOrUpdateFunnelPage({
        subAccountId: subaccountId,
        funnelId,
        funnelPageId: funnelPage.id,
        values: {
          name: e.target.value,
          pathName: funnelPage.pathName,
        },
      });
    },
    onSuccess: () => {
      toast.success("Funnel page updated successfully!");

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not update funnel page! Try again later.");
    },
  });

  const { mutate: onSave, isPending: saving } = useMutation({
    mutationKey: ["save-funnel-page", funnelPage.id],
    mutationFn: async () => {
      const content = JSON.stringify(state.editor.elements);

      if (!content.trim()) {
        toast.info("Can't save an empty page!");

        return;
      }

      await updateFunnelPageContent({
        subAccountId: subaccountId,
        funnelId,
        funnelPageId: funnelPage.id,
        content,
      });
    },
    onSuccess: () => {
      toast.success("Funnel page saved successfully!");

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not save funnel page! Try again later.");
    },
  });

  //set state funnel page details
  useEffect(() => {
    dispatch({
      type: "SET_FUNNELPAGE_ID",
      payload: { funnelPageId: funnelPage.id },
    });
  }, [funnelPage]);

  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-2 p-6 border-b transition-all",
        state.editor.previewMode && "h-0 p-0 overflow-hidden"
      )}
    >
      <aside className="flex item-center gap-4 max-w-[300px]">
        <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
          <ArrowLeftCircle />
        </Link>

        <div className="w-full flex flex-col">
          <Input
            className="h-5 m-0 p-0 text-lg border-none"
            defaultValue={funnelPage.name}
            onBlur={updateFunnelPageName}
            disabled={isPending || saving}
          />

          <span className="text-sm text-muted-foreground">
            Path: /{funnelPage.pathName}
          </span>
        </div>
      </aside>

      <aside className="flex items-center gap-2">
        <Tabs
          defaultValue="Desktop"
          className="w-fit"
          value={state.editor.device}
          onValueChange={(value) => {
            dispatch({
              type: "CHANGE_DEVICE",
              payload: { device: value as DeviceTypes },
            });
          }}
        >
          <TabsList>
            <TabsTrigger value="Desktop" disabled={isPending || saving}>
              <Laptop />
            </TabsTrigger>

            <TabsTrigger value="Tablet" disabled={isPending || saving}>
              <Tablet />
            </TabsTrigger>

            <TabsTrigger value="Mobile" disabled={isPending || saving}>
              <Smartphone />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <span className="text-sm">Device: {state.editor.device}</span>
      </aside>

      <aside className="flex items-center gap-2">
        <Button
          className="hover:bg-slate-800"
          variant={"ghost"}
          size={"icon"}
          onClick={onPreviewClick}
          disabled={isPending || saving}
        >
          <EyeIcon />
        </Button>

        <Button
          className="hover:bg-slate-800"
          variant={"ghost"}
          size={"icon"}
          disabled={!(state.history.currentIndex > 0) || isPending || saving}
          onClick={onUndo}
        >
          <Undo2 />
        </Button>

        <Button
          className="hover:bg-slate-800 mr-4"
          variant={"ghost"}
          size={"icon"}
          disabled={
            !(state.history.currentIndex < state.history.history.length - 1) ||
            isPending ||
            saving
          }
          onClick={onRedo}
        >
          <Redo2 />
        </Button>

        <div className="flex flex-col item-center mr-4">
          <div className="flex items-center gap-4 text-sm">
            Draft
            <Switch disabled defaultChecked={true} />
            Publish
          </div>

          <span className="text-muted-foreground text-sm">
            Last updated {format(funnelPage.updatedAt, "MM/dd/yyyy")}
          </span>
        </div>

        <Button onClick={() => onSave()} disabled={isPending || saving}>
          Save
        </Button>
      </aside>
    </nav>
  );
};

export default FunnelEditorNav;
