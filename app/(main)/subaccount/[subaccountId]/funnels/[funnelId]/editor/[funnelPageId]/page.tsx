export default async function EditorFunnelPage({
  params: { subaccountId, funnelId, funnelPageId },
}: {
  params: { subaccountId: string; funnelId: string; funnelPageId: string };
}) {
  return (
    <div>
      EditorFunnelPage {subaccountId} {funnelId} {funnelPageId}
    </div>
  );
}
