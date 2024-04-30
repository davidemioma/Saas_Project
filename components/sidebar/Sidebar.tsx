import React from "react";
import { AuthUser } from "@/types";
import SidebarOptions from "./SidebarOptions";

type Props = {
  id: string;
  user: AuthUser | null;
  type: "agency" | "subaccount";
};

const Sidebar = ({ id, user, type }: Props) => {
  if (!user || !user.agency) {
    return null;
  }

  const details =
    type === "agency"
      ? user?.agency
      : user?.agency.subAccounts.find((subaccount) => subaccount.id === id);

  if (!details) {
    return null;
  }

  let sideBarLogo = user.agency.agencyLogo || "/assets/plura-logo.svg";

  const isWhiteLabeledAgency = user.agency.whiteLabel;

  if (!isWhiteLabeledAgency) {
    if (type === "subaccount") {
      sideBarLogo =
        user?.agency.subAccounts.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo ||
        user.agency.agencyLogo ||
        "/assets/plura-logo.svg";
    }
  }

  const sidebarOpt =
    type === "agency"
      ? user.agency.sidebarOptions || []
      : user.agency.subAccounts.find((subaccount) => subaccount.id === id)
          ?.sidebarOptions || [];

  const subaccounts = user.agency.subAccounts.filter((subaccount) =>
    user.permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  return (
    <>
      <SidebarOptions
        id={id}
        user={user}
        details={details}
        sidebarLogo={sideBarLogo}
        defaultOpen={true}
        subAccounts={subaccounts}
        sidebarOpt={sidebarOpt}
      />

      <SidebarOptions
        id={id}
        user={user}
        details={details}
        sidebarLogo={sideBarLogo}
        subAccounts={subaccounts}
        sidebarOpt={sidebarOpt}
      />
    </>
  );
};

export default Sidebar;
