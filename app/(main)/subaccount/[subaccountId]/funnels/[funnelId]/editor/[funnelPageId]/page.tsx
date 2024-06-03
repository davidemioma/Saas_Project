import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getFunnelPage } from "@/data/queries";
import FunnelEditorNav from "./_components/FunnelEditorNav";
import EditorProvider from "@/providers/editor/editor-provider";
import FunnelEditor from "./_components/funnel-editor/FunnelEditor";
import FunnelEditorSidebar from "./_components/FunnelEditorSidebar";

export default async function FunnelPageEditor({
  params: { subaccountId, funnelId, funnelPageId },
}: {
  params: { subaccountId: string; funnelId: string; funnelPageId: string };
}) {
  const funnelPage = await getFunnelPage({
    subAccountId: subaccountId,
    funnelId,
    funnelPageId,
  });

  if (!funnelPage) {
    return redirect(`/subaccount/${subaccountId}/funnels/${funnelId}`);
  }

  return (
    <>
      <div className="-mt-10 flex h-full w-full flex-col items-center justify-center gap-5 lg:hidden">
        <h1 className="text-center text-lg font-bold">
          Can&apos;t use website builder on mobile and tablets! Switch to a
          desktop.
        </h1>

        <Link
          href={`/subaccount/${subaccountId}/funnels/${funnelId}`}
          className="flex items-center transition-all hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to funnel page
        </Link>
      </div>

      <div className="fixed inset-0 z-[20] hidden overflow-hidden bg-background lg:block">
        <EditorProvider
          subaccountId={subaccountId}
          funnelId={funnelId}
          pageDetails={funnelPage}
        >
          <FunnelEditorNav
            subaccountId={subaccountId}
            funnelId={funnelId}
            funnelPage={funnelPage}
          />

          <div className="flex h-full justify-center">
            <FunnelEditor
              subaccountId={subaccountId}
              funnelId={funnelId}
              funnelPageId={funnelPageId}
            />
          </div>

          <FunnelEditorSidebar subaccountId={subaccountId} />
        </EditorProvider>
      </div>
    </>
  );
}
