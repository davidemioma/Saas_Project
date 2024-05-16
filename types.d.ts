import {
  User,
  Agency,
  SubAccount,
  AgencySidebarOption,
  SubAccountSidebarOption,
  Permission,
  Notification,
} from "@prisma/client";

export type SubAccountProps = SubAccount & {
  sidebarOptions: SubAccountSidebarOption[];
};

export type AgencyProps =
  | (Agency & {
      sidebarOptions: AgencySidebarOption[];
      subAccounts: SubAccountProps[];
    })
  | null;

export type AuthUser = User & {
  agency: AgencyProps;
  permissions: Permission[];
};

export type NotificationProps = Notification & {
  user: User;
};

export type PermissionProps = Permission & {
  subAccount: SubAccount;
};

export type PermissionProps = Permission & {
  subAccount: SubAccount | null;
};

export type TeamAgencyProps = Agency & {
  subAccounts: SubAccount[];
};

export type TeamMemberProps = User & {
  agency: TeamAgencyProps | null;
  permissions: PermissionProps[];
};
