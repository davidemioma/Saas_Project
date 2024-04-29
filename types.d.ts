import {
  User,
  Agency,
  SubAccount,
  AgencySidebarOption,
  SubAccountSidebarOption,
  Permission,
} from "@prisma/client";

export type SubAccountProps = SubAccount & {
  sidebarOptions: SubAccountSidebarOption;
};

export type AuthUser = User & {
  agency: Agency & {
    sidebarOptions: AgencySidebarOption;
    subAccounts: SubAccountProps[];
  };
  permissions: Permission[];
};
