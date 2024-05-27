import Link from "next/link";
import prismadb from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import FunnelSteps from "./_components/FunnelSteps";
import FunnelSettings from "./_components/FunnelSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getConnectAccountProducts } from "@/lib/stripe/stripe-actions";

export default async function FunnelPage({
  params: { subaccountId, funnelId },
}: {
  params: { subaccountId: string; funnelId: string };
}) {
  const subAccount = await prismadb.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    select: {
      connectAccountId: true,
    },
  });

  const funnel = await prismadb.funnel.findUnique({
    where: {
      id: funnelId,
      subAccountId: subaccountId,
    },
    include: {
      funnelPages: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!funnel) {
    return redirect(`/subaccount/${subaccountId}/funnels`);
  }

  const products = await getConnectAccountProducts(
    subAccount?.connectAccountId || ""
  );

  return (
    <>
      <Link
        href={`/subaccount/${subaccountId}/funnels`}
        className="flex item-center gap-2 mb-4 text-muted-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <h1 className="text-3xl mb-8">{funnel.name}</h1>

      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="w-full lg:w-1/2 grid grid-cols-2">
          <TabsTrigger value="steps">Steps</TabsTrigger>

          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="steps">
          <FunnelSteps subaccountId={subaccountId} funnel={funnel} />
        </TabsContent>

        <TabsContent value="settings">
          <FunnelSettings
            subaccountId={subaccountId}
            funnel={funnel}
            isConnected={!!subAccount?.connectAccountId}
            products={products || []}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
