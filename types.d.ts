import {
  User,
  Agency,
  SubAccount,
  AgencySidebarOption,
  SubAccountSidebarOption,
  Permission,
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
