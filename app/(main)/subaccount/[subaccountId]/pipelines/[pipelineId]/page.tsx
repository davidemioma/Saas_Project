import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import PipelineView from "../_components/PipelineView";
import PipelineInfoBar from "../_components/PipelineInfoBar";
import PipelineSettings from "../_components/PipelineSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function PipelinePage({
  params: { subaccountId, pipelineId },
}: {
  params: { subaccountId: string; pipelineId: string };
}) {
  const pipeline = await prismadb.pipeline.findUnique({
    where: {
      id: pipelineId,
      subAccountId: subaccountId,
    },
  });

  if (!pipeline) {
    return redirect(`/subaccount/${subaccountId}/pipelines`);
  }

  const allPipelines = await prismadb.pipeline.findMany({
    where: {
      subAccountId: subaccountId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  //lanes are the tasks in the kanban board
  const lanes = await prismadb.lane.findMany({
    where: {
      pipelineId,
    },
    include: {
      tickets: {
        include: {
          tags: true,
          assignedUser: true,
          Customer: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return (
    <Tabs defaultValue="view" className="w-full">
      <TabsList className="bg-transparent w-full h-16 flex items-center justify-between gap-2 mb-4 border-b-2">
        <PipelineInfoBar
          pipelineId={pipelineId}
          subAccountId={subaccountId}
          pipelines={allPipelines}
        />

        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>

          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>

      <TabsContent value="view">
        <PipelineView
          pipelineId={pipelineId}
          pipeline={pipeline}
          subaccountId={subaccountId}
          lanes={lanes}
        />
      </TabsContent>

      <TabsContent value="settings">
        <PipelineSettings subaccountId={subaccountId} pipeline={pipeline} />
      </TabsContent>
    </Tabs>
  );
}
