import { getAuthUserDetails } from "@/data/queries";

export default async function AgencyUserPage({
  params: { agencyId },
}: {
  params: { agencyId: string };
}) {
  const user = await getAuthUserDetails();

  return <div>AgencyUserPage {agencyId}</div>;
}
