"use client";

import React from "react";
import SettingsTabs from "./SettingsTabs";
import MediaBucketTab from "./MediaBucketTab";
import ComponentsTab from "./components-tab/ComponentsTab";
import { Database, Plus, SettingsIcon } from "lucide-react";
import { useEditor } from "@/providers/editor/editor-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  subaccountId: string;
};

const FunnelEditorSidebar = ({ subaccountId }: Props) => {
  const { state } = useEditor();

  if (state.editor.previewMode || state.editor.liveMode) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-y-0 right-0 top-[97px] z-40 h-full w-3/4 overflow-hidden border-l bg-background sm:max-w-sm">
        <Tabs defaultValue="Settings" className="h-full w-full">
          <div className="flex h-full w-full flex-row-reverse">
            <div className="h-screen w-16 border-l transition-all">
              <TabsList className="flex h-fit w-full flex-col items-center justify-evenly gap-4 bg-transparent">
                <TabsTrigger
                  value="Settings"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <SettingsIcon />
                </TabsTrigger>

                <TabsTrigger
                  value="Components"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <Plus />
                </TabsTrigger>

                <TabsTrigger
                  value="Media"
                  className="h-10 w-10 p-0 data-[state=active]:bg-muted"
                >
                  <Database />
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="h-full flex-1 overflow-y-scroll scrollbar-hide">
              <div className="grid gap-4 pb-36">
                <TabsContent value="Settings">
                  <div className="space-y-2 p-6 text-left">
                    <h2 className="text-2xl font-bold">Styles</h2>

                    <p>
                      Show your creativity! You can customize every component as
                      you like.
                    </p>
                  </div>

                  <SettingsTabs />
                </TabsContent>

                <TabsContent value="Media">
                  <MediaBucketTab subaccountId={subaccountId} />
                </TabsContent>

                <TabsContent value="Components">
                  <div className="space-y-2 p-6 text-left">
                    <h2 className="text-2xl font-bold">Components</h2>

                    <p>You can drag and drop components on the canvas</p>
                  </div>

                  <ComponentsTab />
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default FunnelEditorSidebar;
