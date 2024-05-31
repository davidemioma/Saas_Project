"use client";

import React from "react";
import SettingsTabs from "./SettingsTabs";
import { useEditor } from "@/providers/editor/editor-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Plus, SettingsIcon, SquareStackIcon } from "lucide-react";

type Props = {
  subaccountId: string;
};

const FunnelEditorSidebar = ({ subaccountId }: Props) => {
  const { state } = useEditor();

  return (
    <>
      <div className="fixed bg-background inset-y-0 right-0 top-[97px] z-40 w-3/4 sm:max-w-sm h-full border-l overflow-hidden">
        <Tabs defaultValue="Settings" className="w-full h-full">
          <div className="h-full w-full flex flex-row-reverse">
            <div className="w-16 h-screen border-l transition-all">
              <TabsList className="w-full h-fit bg-transparent flex flex-col items-center justify-evenly gap-4 ">
                <TabsTrigger
                  value="Settings"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <SettingsIcon />
                </TabsTrigger>

                <TabsTrigger
                  value="Components"
                  className="data-[state=active]:bg-muted w-10 h-10 p-0"
                >
                  <Plus />
                </TabsTrigger>

                {/* <TabsTrigger
                  value="Layers"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <SquareStackIcon />
                </TabsTrigger> */}

                <TabsTrigger
                  value="Media"
                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                >
                  <Database />
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="h-full flex-1 overflow-y-scroll scrollbar-hide">
              <div className="grid gap-4 pb-36">
                <TabsContent value="Settings">
                  <div className="text-left p-6 space-y-2">
                    <h2 className="text-2xl font-bold">Styles</h2>

                    <p>
                      Show your creativity! You can customize every component as
                      you like.
                    </p>
                  </div>

                  <SettingsTabs />
                </TabsContent>

                <TabsContent value="Media">
                  <div>MediaBucketTab</div>
                </TabsContent>

                <TabsContent value="Components">
                  <div className="text-left p-6 space-y-2">
                    <h2 className="text-2xl font-bold">Components</h2>

                    <p>You can drag and drop components on the canvas</p>
                  </div>

                  <div>components tabs</div>
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
