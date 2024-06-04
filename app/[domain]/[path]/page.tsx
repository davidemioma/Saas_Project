import prismadb from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getDomainContent } from "@/data/queries";
import EditorProvider from "@/providers/editor/editor-provider";
import FunnelEditor from "../../(main)/subaccount/[subaccountId]/funnels/[funnelId]/editor/[funnelPageId]/_components/funnel-editor/FunnelEditor";

export default async function PathPage({
  params: { domain, path },
}: {
  params: { domain: string; path: string };
}) {
  const domainContent = await getDomainContent({
    subDomainName: domain.slice(0, -1),
  });

  if (!domainContent) {
    return notFound();
  }

  const pageData = domainContent.funnelPages.find(
    (page) => page.pathName === path,
  );

  if (!pageData) {
    return notFound();
  }

  await prismadb.funnelPage.update({
    where: {
      id: pageData.id,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
  });

  return (
    <EditorProvider
      subaccountId={domainContent.subAccountId}
      funnelId={domainContent.id}
      pageDetails={pageData}
    >
      <FunnelEditor
        subaccountId={domainContent.subAccountId}
        funnelId={domainContent.id}
        funnelPageId={pageData.id}
        liveMode={true}
      />
    </EditorProvider>
  );
}
