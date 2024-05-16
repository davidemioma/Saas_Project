export default async function SubAccountPage({
  params: { subaccountId },
}: {
  params: { subaccountId: string };
}) {
  return <div>SubAccountPage {subaccountId}</div>;
}
