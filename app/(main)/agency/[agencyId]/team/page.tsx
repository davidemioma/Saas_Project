import prismadb from "@/lib/prisma";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import TeamContent from "./_component/TeamContent";

export default async function AgencyTeamPage({
  params: { agencyId },
}: {
  params: { agencyId: string };
}) {
  const user = await currentUser();

  if (!user) {
    return redirect("/agency/sign-in");
  }

  const agencyDetails = await prismadb.agency.findUnique({
    where: {
      id: agencyId,
    },
    include: {
      subAccounts: true,
    },
  });

  if (!agencyDetails) {
    return redirect("/");
  }

  const teamMembers = await prismadb.user.findMany({
    where: {
      agencyId,
    },
    include: {
      agency: {
        include: {
          subAccounts: true,
        },
      },
      permissions: {
        include: {
          subAccount: true,
        },
      },
    },
  });

  return <TeamContent data={teamMembers} />;
}
