import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function FunnelPageEditor({
  params: { subaccountId, funnelId, funnelPageId },
}: {
  params: { subaccountId: string; funnelId: string; funnelPageId: string };
}) {
  const funnelPage = await prismadb.funnelPage.findUnique({
    where: {
      id: funnelPageId,
      funnel: {
        id: funnelId,
        subAccountId: subaccountId,
      },
    },
  });

  if (!funnelPage) {
    return redirect(`/subaccount/${subaccountId}/funnels/${funnelId}`);
  }

  return (
    <div className="fixed inset-0 z-[20] bg-background overflow-hidden">
      EditorFunnelPage {subaccountId} {funnelId} {funnelPageId}
    </div>
  );
}
