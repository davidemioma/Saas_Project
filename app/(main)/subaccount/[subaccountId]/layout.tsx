import { redirect } from "next/navigation";
import InfoBar from "@/components/InfoBar";
import { currentUser } from "@clerk/nextjs";
import { NotificationProps } from "@/types";
import Sidebar from "@/components/sidebar/Sidebar";
import Unauthorised from "@/components/Unauthorised";
import {
  verifyAndAcceptInvitation,
  getAuthUserDetails,
  getNotificationsAndUser,
} from "@/data/queries";

export default async function SubAccountLayout({
  children,
  params: { subaccountId },
}: Readonly<{
  children: React.ReactNode;
  params: { subaccountId: string };
}>) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const agencyId = await verifyAndAcceptInvitation();

  if (!agencyId) {
    return <Unauthorised />;
  }

  if (!user.privateMetadata.role) {
    return <Unauthorised />;
  }

  const userDetails = await getAuthUserDetails();

  const hasPermission = userDetails?.permissions.find(
    (permissions) =>
      permissions.access && permissions.subAccountId === subaccountId
  );

  if (!hasPermission) {
    return <Unauthorised />;
  }

  let notifications: NotificationProps[] = [];

  const allNotifications = await getNotificationsAndUser({ agencyId });

  if (
    user.privateMetadata.role !== "AGENCY_OWNER" &&
    user.privateMetadata.role !== "AGENCY_ADMIN"
  ) {
    notifications = allNotifications;
  } else {
    notifications = allNotifications.filter(
      (notification) => notification.subAccountId === subaccountId
    );
  }

  return (
    <div className="h-screen overflow-y-hidden">
      <Sidebar id={subaccountId} user={userDetails} type="subaccount" />

      <div className="md:pl-[300px]">
        <InfoBar notifications={notifications} />

        <div className="relative mt-24 p-4 h-screen overflow-y-scroll">
          {children}
        </div>
      </div>
    </div>
  );
}
