import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import UserDetails from "@/components/forms/UserDetails";
import AgencyDetails from "@/components/forms/AgencyDetails";
import { getAuthUserDetails, getUserPermissions } from "@/data/queries";

export default async function AgencySettings({
  params: { agencyId },
}: {
  params: { agencyId: string };
}) {
  const user = await currentUser();

  if (!user) return redirect("/agency/sign-in");

  const userDetails = await getAuthUserDetails();

  if (!userDetails) return redirect("/");

  const subAccountsPermissions = await getUserPermissions({
    userId: userDetails.id,
  });

  const agencyDetails = await prismadb.agency.findUnique({
    where: {
      id: agencyId,
    },
    include: {
      subAccounts: true,
    },
  });

  if (!agencyDetails) return redirect("/");

  const subAccounts = agencyDetails.subAccounts;

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      <AgencyDetails data={agencyDetails} />

      <UserDetails
        type="agency"
        id={agencyId}
        subAccounts={subAccounts}
        userData={userDetails}
        subAccountsPermissions={subAccountsPermissions}
      />
    </div>
  );
}
