import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Pipelines({
  params: { subaccountId },
}: {
  params: { subaccountId: string };
}) {
  const pipelineExists = await prismadb.pipeline.findFirst({
    where: { subAccountId: subaccountId },
  });

  if (pipelineExists) {
    return redirect(
      `/subaccount/${subaccountId}/pipelines/${pipelineExists.id}`
    );
  }

  const newPipeline = await prismadb.pipeline.create({
    data: {
      subAccountId: subaccountId,
      name: "First Pipeline",
    },
  });

  if (!newPipeline) {
    return redirect(`/subaccount/${subaccountId}`);
  }

  return redirect(`/subaccount/${subaccountId}/pipelines/${newPipeline.id}`);
}
