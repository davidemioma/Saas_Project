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
      <div className="lg:hidden w-full h-full flex flex-col items-center justify-center gap-5 -mt-10">
        <h1 className="text-lg text-center font-bold">
          Can&apos;t use website builder on mobile and tablets! Switch to a
          desktop.
        </h1>

        <Link
          href={`/subaccount/${subaccountId}/funnels/${funnelId}`}
          className="flex items-center hover:underline transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to funnel page
        </Link>
      </div>

      <div className="hidden lg:block fixed inset-0 z-[20] bg-background overflow-hidden">
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

          <div className="h-full flex justify-center mr-[385px]">
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
