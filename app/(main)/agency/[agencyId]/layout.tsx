import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Sidebar from "@/components/sidebar/Sidebar";
import Unauthorised from "@/components/Unauthorised";
import {
  getAuthUserDetails,
  getNotificationsAndUser,
  verifyAndAcceptInvitation,
} from "@/data/queries";

export default async function AgencyUserLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { agencyId: string };
}>) {
  const user = await currentUser();

  if (!user) {
    return redirect("/");
  }

  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) {
    return redirect("/agency");
  }

  if (
    user.privateMetadata.role !== "AGENCY_OWNER" &&
    user.privateMetadata.role !== "AGENCY_ADMIN"
  ) {
    return <Unauthorised />;
  }

  const userDetails = await getAuthUserDetails();

  const notifications = await getNotificationsAndUser({ agencyId });

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.agencyId} user={userDetails} type="agency" />

      <div className="md:pl-[300px]">{children}</div>
    </div>
  );
}
