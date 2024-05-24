import Stripe from "stripe";
import {
  User,
  Agency,
  SubAccount,
  AgencySidebarOption,
  SubAccountSidebarOption,
  Permission,
  Notification,
  Lane,
  Ticket,
  Tag,
  Contact,
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

export type TicketProps = Ticket & {
  tags: Tag[];
  assignedUser: User | null;
  Customer: Contact | null;
};

export type LaneProps = Lane & {
  tickets: TicketProps[];
};

export type ContactProps = Contact & {
  tickets: { value: number | null }[];
};

export type AddressProps = {
  city: string;
  state: string;
  line1: string;
  postal_code: string;
  country: string;
};

export type ShippingInfoProps = {
  name: string;
  address: AddressProps;
};

export type StripeCustomerType = {
  name: string;
  email: string;
  address: AddressProps;
  shipping: ShippingInfoProps;
};

export type StripePriceList = Stripe.ApiList<Stripe.Price>;
