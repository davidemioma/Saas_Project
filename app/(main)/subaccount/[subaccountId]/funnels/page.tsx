import prismadb from "@/lib/prisma";
import AllFunnels from "./_components/AllFunnels";

export default async function AllFunnelsPage({
  params: { subaccountId },
}: {
  params: { subaccountId: string };
}) {
  const funnels = await prismadb.funnel.findMany({
    where: {
      subAccountId: subaccountId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <AllFunnels subAccountId={subaccountId} funnels={funnels} />;
}
