"use server";

import { toast } from "sonner";
import prismadb from "@/lib/prisma";
import { LaneProps } from "@/types";
import { Agency, FunnelPage, Ticket, User } from "@prisma/client";
import { LaneValidator } from "@/lib/validators/lane";
import { UserValidator } from "@/lib/validators/user";
import { MediaValidator } from "@/lib/validators/media";
import { FunnelValidator } from "@/lib/validators/funnel";
import { AgencyValidator } from "@/lib/validators/agency";
import { TicketValidator } from "@/lib/validators/ticket";
import { AccountValidator } from "@/lib/validators/account";
import { ContactValidator } from "@/lib/validators/contact";
import { PipelineValidator } from "@/lib/validators/pipeline";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { SubAccountValidator } from "@/lib/validators/subaccount";
import { InvitationValidator } from "@/lib/validators/invitation";
import { FunnelPageValidator } from "@/lib/validators/funnel-page";

export const getAuthUserRoleByEmail = async (email?: string) => {
  if (!email) return undefined;

  const authUserRole = await prismadb.user.findUnique({
    where: {
      email,
    },
    select: {
      role: true,
    },
  });

  return authUserRole?.role;
};

export const getAuthUserDetails = async () => {
  try {
    const user = await currentUser();

    if (!user) return null;

    const userDetails = await prismadb.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      include: {
        agency: {
          include: {
            sidebarOptions: true,
            subAccounts: {
              include: {
                sidebarOptions: true,
              },
            },
          },
        },
        permissions: true,
      },
    });

    return userDetails;
  } catch (err) {
    return null;
  }
};

export const saveActivityLogNotification = async ({
  agencyId,
  subAccountId,
  description,
}: {
  agencyId?: string;
  subAccountId?: string;
  description: string;
}) => {
  try {
    let userData;

    const user = await currentUser();

    if (!user) {
      userData = await prismadb.user.findFirst({
        where: {
          agency: {
            subAccounts: {
              some: { id: subAccountId },
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
    } else {
      userData = await prismadb.user.findUnique({
        where: {
          email: user.emailAddresses[0].emailAddress,
        },
        select: {
          id: true,
          name: true,
        },
      });
    }

    if (!userData) {
      throw new Error("Unauthorised, No user available!");
    }

    let foundAgencyId = agencyId;

    if (!foundAgencyId) {
      if (!subAccountId) {
        throw new Error(
          "You need to provide at least an agency ID or a sub account ID!",
        );
      }

      const subAccount = await prismadb.subAccount.findUnique({
        where: {
          id: subAccountId,
        },
        select: {
          agencyId: true,
        },
      });

      foundAgencyId = subAccount?.agencyId;
    }

    if (subAccountId && foundAgencyId) {
      await prismadb.notification.create({
        data: {
          userId: userData.id,
          agencyId: foundAgencyId,
          subAccountId,
          notification: `${userData.name} | ${description}`,
        },
      });
    } else if (!subAccountId && foundAgencyId) {
      await prismadb.notification.create({
        data: {
          userId: userData.id,
          agencyId: foundAgencyId,
          notification: `${userData.name} | ${description}`,
        },
      });
    } else {
      throw new Error(
        "You need to provide at least an agency ID or a sub account ID!",
      );
    }
  } catch (err) {
    console.log("Save activity log error" + err);

    toast.error("Something went wrong!");
  }
};

export const createTeamUser = async ({ user }: { user: User }) => {
  try {
    if (user.role === "AGENCY_OWNER") return null;

    const newUser = await prismadb.user.create({
      data: { ...user },
    });

    return newUser;
  } catch (err) {
    return null;
  }
};

export const verifyAndAcceptInvitation = async () => {
  try {
    let agencyId = null;

    const user = await currentUser();

    if (!user) return null;

    const invitation = await prismadb.invitation.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
        status: "PENDING",
      },
    });

    if (invitation) {
      const newUser = await createTeamUser({
        user: {
          id: user.id,
          agencyId: invitation.agencyId,
          name: `${user.firstName} ${user.lastName}`,
          email: invitation.email,
          role: invitation.role,
          avatarUrl: user.imageUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      if (!newUser) {
        return null;
      }

      await saveActivityLogNotification({
        agencyId: invitation.agencyId,
        subAccountId: undefined,
        description: "Joined",
      });

      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: newUser.role || "SUBACCOUNT_USER",
        },
      });

      await prismadb.invitation.delete({
        where: { email: newUser.email },
      });

      agencyId = newUser.agencyId;
    } else {
      const userDetails = await prismadb.user.findUnique({
        where: {
          email: user.emailAddresses[0].emailAddress,
        },
        select: {
          agencyId: true,
        },
      });

      agencyId = userDetails?.agencyId;
    }

    return agencyId;
  } catch (err) {
    return null;
  }
};

export const updateAgencyDetails = async ({
  agencyId,
  agencyDetail,
}: {
  agencyId: string;
  agencyDetail: Partial<Agency>;
}) => {
  try {
    const agency = await prismadb.agency.update({
      where: {
        id: agencyId,
      },
      data: {
        ...agencyDetail,
      },
      select: {
        id: true,
      },
    });

    return agency;
  } catch (err) {
    console.log("Update Agency" + err);

    toast.error("Unable to update agency details");
  }
};

export const initUser = async (newUser: Partial<User>) => {
  try {
    const user = await currentUser();

    if (!user) return;

    await prismadb.user.upsert({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      update: newUser,
      create: {
        id: user.id,
        avatarUrl: user.imageUrl,
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailAddresses[0].emailAddress,
        role: newUser.role || "SUBACCOUNT_USER",
      },
    });

    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        role: newUser.role || "SUBACCOUNT_USER",
      },
    });
  } catch (err) {
    console.log("Init user" + err);

    toast.error("Unable to create/update user");
  }
};

export const createOrUpdateAgency = async ({
  agencyId,
  values,
  customerId,
}: {
  agencyId?: string;
  customerId: string;
  values: AgencyValidator;
}) => {
  try {
    let agencyDetail;

    if (!values.companyEmail) {
      toast.error("Company email required!");

      return null;
    }

    if (agencyId) {
      agencyDetail = await prismadb.agency.update({
        where: {
          id: agencyId,
        },
        data: {
          ...values,
        },
        select: {
          id: true,
        },
      });
    } else {
      const newAgency = await prismadb.agency.create({
        data: {
          ...values,
          customerId,
          connectAccountId: "",
          goal: 5,
        },
        select: {
          id: true,
          companyEmail: true,
        },
      });

      agencyDetail = await prismadb.agency.update({
        where: {
          id: newAgency.id,
        },
        data: {
          users: {
            connect: {
              email: newAgency.companyEmail,
            },
          },
          sidebarOptions: {
            create: [
              {
                name: "Dashboard",
                icon: "category",
                link: `/agency/${newAgency.id}`,
              },
              {
                name: "Launchpad",
                icon: "clipboardIcon",
                link: `/agency/${newAgency.id}/launchpad`,
              },
              {
                name: "Billing",
                icon: "payment",
                link: `/agency/${newAgency.id}/billing`,
              },
              {
                name: "Settings",
                icon: "settings",
                link: `/agency/${newAgency.id}/settings`,
              },
              {
                name: "Sub Accounts",
                icon: "person",
                link: `/agency/${newAgency.id}/all-subaccounts`,
              },
              {
                name: "Team",
                icon: "shield",
                link: `/agency/${newAgency.id}/team`,
              },
            ],
          },
        },
        select: {
          id: true,
        },
      });
    }

    return agencyDetail;
  } catch (err) {
    console.log("Create/Update Agency" + err);

    toast.error("Unable to create/update agency");

    return null;
  }
};

export const deleteAgency = async ({ agencyId }: { agencyId: string }) => {
  try {
    //todo: Cancel the subscription

    await prismadb.agency.delete({
      where: {
        id: agencyId,
      },
    });
  } catch (err) {
    console.log("Delete Agency" + err);

    toast.error("Unable to delete agency details");
  }
};

export const getNotificationsAndUser = async ({
  agencyId,
}: {
  agencyId: string;
}) => {
  try {
    if (!agencyId) return [];

    const notifications = await prismadb.notification.findMany({
      where: {
        agencyId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  } catch (err) {
    return [];
  }
};

export const createOrUpdateSubAccount = async ({
  userName,
  agencyId,
  subAccountId,
  values,
}: {
  userName: string;
  agencyId: string;
  subAccountId?: string;
  values: SubAccountValidator;
}) => {
  try {
    if (!values.companyEmail) {
      toast.error("Company email required!");

      return null;
    }

    const agencyOwner = await prismadb.user.findFirst({
      where: {
        agency: {
          id: agencyId,
        },
        role: "AGENCY_OWNER",
      },
    });

    if (!agencyOwner) {
      throw new Error("Error, Could not find agency owner!");
    }

    let subAccount;

    if (subAccountId) {
      subAccount = await prismadb.subAccount.update({
        where: {
          id: subAccountId,
        },
        data: {
          ...values,
        },
        select: {
          id: true,
          agencyId: true,
          name: true,
        },
      });
    } else {
      const subaccountsCount = await prismadb.subAccount.count({
        where: {
          agencyId,
        },
      });

      const subscription = await prismadb.subscription.findUnique({
        where: {
          agencyId,
        },
        select: {
          active: true,
        },
      });

      if (!subscription?.active && subaccountsCount >= 3) {
        toast.error(
          "You have reached your max number of sub account! Upgrade to a pro plan to create more sub accounts.",
        );

        return null;
      }

      const newSubAccount = await prismadb.subAccount.create({
        data: {
          agencyId,
          ...values,
          connectAccountId: "",
          goal: 5000,
        },
        select: {
          id: true,
        },
      });

      await prismadb.permission.create({
        data: {
          subAccountId: newSubAccount.id,
          access: true,
          email: agencyOwner.email,
        },
      });

      await prismadb.pipeline.create({
        data: {
          subAccountId: newSubAccount.id,
          name: "Lead Cycle",
        },
      });

      subAccount = await prismadb.subAccount.update({
        where: {
          id: newSubAccount.id,
        },
        data: {
          sidebarOptions: {
            create: [
              {
                name: "Launchpad",
                icon: "clipboardIcon",
                link: `/subaccount/${newSubAccount.id}/launchpad`,
              },
              {
                name: "Settings",
                icon: "settings",
                link: `/subaccount/${newSubAccount.id}/settings`,
              },
              {
                name: "Funnels",
                icon: "pipelines",
                link: `/subaccount/${newSubAccount.id}/funnels`,
              },
              {
                name: "Media",
                icon: "database",
                link: `/subaccount/${newSubAccount.id}/media`,
              },
              {
                name: "Automations",
                icon: "chip",
                link: `/subaccount/${newSubAccount.id}/automations`,
              },
              {
                name: "Pipelines",
                icon: "flag",
                link: `/subaccount/${newSubAccount.id}/pipelines`,
              },
              {
                name: "Contacts",
                icon: "person",
                link: `/subaccount/${newSubAccount.id}/contacts`,
              },
              {
                name: "Dashboard",
                icon: "category",
                link: `/subaccount/${newSubAccount.id}`,
              },
            ],
          },
        },
        select: {
          id: true,
          agencyId: true,
          name: true,
        },
      });
    }

    await saveActivityLogNotification({
      agencyId: subAccount.agencyId,
      subAccountId: subAccount.id,
      description: `${userName} | updated sub account | ${subAccount.name}`,
    });
  } catch (err) {
    console.log("Create/Update Sub account" + err);

    toast.error("Unable to create/update sub account");

    return null;
  }
};

export const getUserPermissions = async ({ userId }: { userId: string }) => {
  try {
    if (!userId) return [];

    const user = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        permissions: {
          include: {
            subAccount: true,
          },
        },
      },
    });

    if (!user?.permissions) {
      return [];
    }

    return user.permissions;
  } catch (err) {
    return [];
  }
};

export const updateUser = async (values: UserValidator) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error(
        "Unauthorised, You need to be logged in to perform this action",
      );
    }

    const userExists = await prismadb.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });

    if (!userExists) {
      throw new Error("Unauthorised, User not found");
    }

    await prismadb.user.update({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      data: {
        ...values,
      },
    });

    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        role: values.role || "SUBACCOUNT_USER",
      },
    });
  } catch (err) {
    console.log("UPDATE_USER", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const updateAccountRole = async ({
  agencyId,
  userId,
  values,
}: {
  agencyId: string;
  userId: string;
  values: AccountValidator;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error(
        "Unauthorised, You need to be logged in to perform this action",
      );
    }

    //Check if agency exists
    const agencyExists = await prismadb.agency.findUnique({
      where: {
        id: agencyId,
      },
    });

    if (!agencyExists) {
      throw new Error("Unauthorised, Agency not found");
    }

    //check the current user if he an agency owner
    const userExists = await prismadb.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
        agencyId,
        role: "AGENCY_OWNER",
      },
      select: {
        agencyId: true,
      },
    });

    if (!userExists) {
      throw new Error("Unauthorised, User not found");
    }

    await prismadb.user.update({
      where: {
        id: userId,
      },
      data: {
        ...values,
      },
    });

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: values.role || "SUBACCOUNT_USER",
      },
    });
  } catch (err) {
    console.log("UPDATE_ACCOUNT", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const changeUserPermissions = async ({
  subAccountId,
  permissionsId,
  agencyId,
  adminOwnerName,
  email,
  access,
  type,
}: {
  subAccountId: string;
  permissionsId: string;
  agencyId: string;
  adminOwnerName: string;
  email: string;
  access: boolean;
  type: "agency" | "subaccount";
}) => {
  try {
    const permission = await prismadb.permission.upsert({
      where: { id: permissionsId },
      update: { access },
      create: {
        access,
        email,
        subAccountId: subAccountId,
      },
      select: {
        subAccount: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (type === "agency") {
      await saveActivityLogNotification({
        agencyId,
        description: `Gave ${adminOwnerName} access to | ${permission.subAccount.name} `,
        subAccountId: permission.subAccount.id,
      });
    }
  } catch (err) {
    console.log("CHANGE_PERMISSION", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const deleteSubAccount = async (
  subAccountId: string | null | undefined,
) => {
  try {
    if (!subAccountId) {
      throw new Error("Sub account ID required!");
    }

    const subAccount = await prismadb.subAccount.findUnique({
      where: {
        id: subAccountId,
      },
    });

    if (!subAccount) {
      throw new Error("Sub account not found!");
    }

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Deleted a subaccount | ${subAccount?.name}`,
      subAccountId,
    });

    await prismadb.subAccount.delete({
      where: {
        id: subAccountId,
      },
    });
  } catch (err) {
    console.log("DELETE_SUBACCOUNT", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const removeUser = async (userId: string) => {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: undefined,
      },
    });

    await prismadb.user.delete({ where: { id: userId } });
  } catch (err) {
    console.log("DELETE_USER", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const sendInvite = async ({
  agencyId,
  values,
}: {
  agencyId: string;
  values: InvitationValidator;
}) => {
  try {
    const membersCount = await prismadb.user.count({
      where: {
        agencyId,
      },
    });

    const subscription = await prismadb.subscription.findUnique({
      where: {
        agencyId,
      },
      select: {
        active: true,
      },
    });

    if (!subscription?.active && membersCount >= 2) {
      toast.error(
        "You have reached your max number of invite! Upgrade to a pro plan to send more invites.",
      );

      return null;
    }

    await prismadb.invitation.create({
      data: {
        agencyId,
        email: values.email,
        role: values.role,
      },
    });

    await clerkClient.invitations.createInvitation({
      emailAddress: values.email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role: values.role,
      },
    });

    await saveActivityLogNotification({
      agencyId,
      description: `Invited ${values.email}`,
      subAccountId: undefined,
    });
  } catch (err) {
    console.log("SEND_INVITE_BY_EMAIL", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const createMedia = async ({
  subAccountId,
  values,
}: {
  subAccountId: string;
  values: MediaValidator;
}) => {
  try {
    await prismadb.media.create({
      data: {
        subAccountId,
        name: values.name,
        link: values.link,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Uploaded a media file | ${values.name}`,
      subAccountId,
    });
  } catch (err) {
    console.log("CREATE_MEDIA", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const deleteMedia = async (mediaId: string) => {
  try {
    const deletedMedia = await prismadb.media.delete({
      where: {
        id: mediaId,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Deleted a media file | ${deletedMedia?.name}`,
      subAccountId: deletedMedia.subAccountId,
    });
  } catch (err) {
    console.log("DELETE_MEDIA", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const createOrUpdatePipeline = async ({
  subAccountId,
  pipelineId,
  values,
}: {
  subAccountId: string;
  pipelineId?: string;
  values: PipelineValidator;
}) => {
  try {
    let pipeline;

    if (pipelineId) {
      pipeline = await prismadb.pipeline.update({
        where: {
          id: pipelineId,
        },
        data: {
          ...values,
        },
      });
    } else {
      pipeline = await prismadb.pipeline.create({
        data: {
          subAccountId,
          ...values,
        },
      });
    }

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `${pipelineId ? "Updates" : "Creates"} a pipeline | ${
        pipeline?.name
      }`,
      subAccountId: subAccountId,
    });
  } catch (err) {
    console.log("CREATE_OR_UPDATE_PIPELINE", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const deletePipeline = async ({
  subAccountId,
  pipelineId,
}: {
  subAccountId: string;
  pipelineId: string;
}) => {
  try {
    if (!subAccountId || !pipelineId) {
      throw new Error(`SubAccount Id and pipeline Id required`);
    }

    const deletedPipeline = await prismadb.pipeline.delete({
      where: {
        id: pipelineId,
        subAccountId,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Deleted a pipeline | ${deletedPipeline?.name}`,
      subAccountId: subAccountId,
    });
  } catch (err) {
    console.log("DELETE_PIPELINE", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const createOrUpdateLane = async ({
  subAccountId,
  pipelineId,
  laneId,
  values,
}: {
  subAccountId: string;
  pipelineId: string;
  laneId?: string;
  values: LaneValidator;
}) => {
  try {
    if (!subAccountId || !pipelineId) {
      throw new Error(`SubAccount Id and pipeline Id required`);
    }

    let lane;

    if (laneId) {
      lane = await prismadb.lane.update({
        where: {
          id: laneId,
        },
        data: {
          ...values,
        },
      });
    } else {
      const lastLane = await prismadb.lane.findFirst({
        where: {
          pipelineId,
        },
        select: {
          order: true,
        },
        orderBy: {
          order: "desc",
        },
      });

      const newOrder = lastLane ? lastLane.order + 1 : 0;

      lane = await prismadb.lane.create({
        data: {
          pipelineId,
          order: newOrder,
          ...values,
        },
      });
    }

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `${laneId ? "Updates" : "Creates"} a lane | ${lane?.name}`,
      subAccountId: subAccountId,
    });
  } catch (err) {
    console.log("CREATE_OR_UPDATE_LANE", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const deleteLane = async ({
  subAccountId,
  pipelineId,
  laneId,
}: {
  subAccountId: string;
  pipelineId: string;
  laneId: string;
}) => {
  try {
    if (!subAccountId || !pipelineId || !laneId) {
      throw new Error(`SubAccount Id, lane Id and pipeline Id required`);
    }

    const deletedLane = await prismadb.lane.delete({
      where: {
        id: laneId,
        pipelineId,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Deleted a lane | ${deletedLane?.name}`,
      subAccountId: subAccountId,
    });
  } catch (err) {
    console.log("DELETE_LANE", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const updateLaneOrder = async ({
  pipelineId,
  lanes,
}: {
  pipelineId: string;
  lanes: LaneProps[];
}) => {
  try {
    await Promise.all(
      lanes.map(async (lane) => {
        await prismadb.lane.update({
          where: {
            id: lane.id,
            pipelineId,
          },
          data: {
            order: lane.order,
          },
        });
      }),
    );
  } catch (err) {
    console.log("UPDATE_LANE_ORDER", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const updateTicketOrder = async ({
  pipelineId,
  tickets,
}: {
  pipelineId: string;
  tickets: Ticket[];
}) => {
  try {
    await Promise.all(
      tickets.map(async (ticket) => {
        await prismadb.ticket.update({
          where: {
            id: ticket.id,
            Lane: {
              pipelineId,
            },
          },
          data: {
            laneId: ticket.laneId,
            order: ticket.order,
          },
        });
      }),
    );
  } catch (err) {
    console.log("UPDATE_TICKET_ORDER", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const getSubAccountTeamMembers = async (subAccountId: string) => {
  try {
    const teamMembers = await prismadb.user.findMany({
      where: {
        agency: {
          subAccounts: {
            some: {
              id: subAccountId,
            },
          },
        },
        role: "SUBACCOUNT_USER",
        permissions: {
          some: {
            subAccountId,
            access: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return teamMembers;
  } catch (err) {
    console.log("GET_SUBACCOUNT_TEAM_MEMBERS", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const getSearchedContacts = async (searchTerms: string) => {
  try {
    const contacts = await prismadb.contact.findMany({
      where: {
        name: {
          contains: searchTerms,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return contacts;
  } catch (err) {
    console.log("GET_SEARCHED_CONTACTS", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const getSubAccountTags = async (subAccountId: string) => {
  try {
    if (!subAccountId) return [];

    const tags = await prismadb.tag.findMany({
      where: {
        subAccountId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return tags;
  } catch (err) {
    console.log("GET_SUBACCOUNT_TAGS", err);

    return [];
  }
};

export const createAndUpdateTicket = async ({
  ticketId,
  laneId,
  subAccountId,
  values,
}: {
  ticketId?: string;
  laneId: string;
  subAccountId: string;
  values: TicketValidator;
}) => {
  try {
    if (!laneId || !subAccountId) {
      throw new Error(`lane Id and subaccount Id is required`);
    }

    let ticket;

    if (ticketId) {
      ticket = await prismadb.ticket.update({
        where: {
          id: ticketId,
          laneId,
        },
        data: {
          ...values,
        },
      });
    } else {
      const lastTicket = await prismadb.ticket.findFirst({
        where: {
          laneId,
        },
        select: {
          order: true,
        },
        orderBy: {
          order: "desc",
        },
      });

      const newOrder = lastTicket ? lastTicket.order + 1 : 0;

      ticket = await prismadb.ticket.create({
        data: {
          laneId,
          ...values,
          order: newOrder,
        },
      });
    }

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Updated a ticket | ${ticket?.name}`,
      subAccountId,
    });

    return ticket;
  } catch (err) {
    console.log("UPSERT_TICKET", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const createOrUpdateTag = async ({
  subAccountId,
  name,
  color,
}: {
  subAccountId: string;
  name: string;
  color: string;
}) => {
  try {
    if (!subAccountId) {
      throw new Error(`lane Id and subaccount Id is required`);
    }

    let tag;

    const tagExists = await prismadb.tag.findFirst({
      where: {
        subAccountId,
        name,
        color,
      },
    });

    if (tagExists) {
      tag = await prismadb.tag.update({
        where: {
          id: tagExists.id,
          subAccountId,
        },
        data: {
          name,
          color,
        },
      });
    } else {
      tag = await prismadb.tag.create({
        data: {
          subAccountId,
          name,
          color,
        },
      });
    }

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Updated a tag | ${tag?.name}`,
      subAccountId,
    });
  } catch (err) {
    console.log("UPSERT_TAG", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const deleteTagById = async ({
  subAccountId,
  tagId,
}: {
  subAccountId: string;
  tagId: string;
}) => {
  try {
    if (!subAccountId || !tagId) {
      throw new Error(`SubAccount Id and tag Id required`);
    }

    const deletedTag = await prismadb.tag.delete({
      where: {
        id: tagId,
        subAccountId,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Deleted a tag | ${deletedTag?.name}`,
      subAccountId,
    });
  } catch (err) {
    console.log("DELETE_TAG", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const deleteTicketById = async ({
  subAccountId,
  ticketId,
  laneId,
}: {
  subAccountId: string;
  ticketId: string;
  laneId: string;
}) => {
  try {
    if (!subAccountId || !ticketId || !laneId) {
      throw new Error(`SubAccount Id, lane Id and ticket Id required`);
    }

    const deletedTicket = await prismadb.ticket.delete({
      where: {
        id: ticketId,
        laneId,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Deleted a ticket | ${deletedTicket?.name}`,
      subAccountId,
    });
  } catch (err) {
    console.log("DELETE_TICKET", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const createOrUpdateContact = async ({
  subAccountId,
  values,
  contactId,
}: {
  subAccountId: string;
  values: ContactValidator;
  contactId?: string;
}) => {
  try {
    if (!subAccountId) {
      throw new Error(`SubAccount Id is required`);
    }

    let contact;

    if (contactId) {
      contact = await prismadb.contact.update({
        where: {
          id: contactId,
          subAccountId,
        },
        data: {
          ...values,
        },
      });
    } else {
      contact = await prismadb.contact.create({
        data: {
          subAccountId,
          ...values,
        },
      });
    }

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `${contactId ? "Updated" : "Created"} a contact | ${
        contact.name
      }`,
      subAccountId,
    });
  } catch (err) {
    console.log("UPSERT_CONTACT", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const createOrUpdateFunnel = async ({
  subAccountId,
  values,
  funnelId,
}: {
  subAccountId: string;
  values: FunnelValidator;
  funnelId?: string;
}) => {
  try {
    if (!subAccountId) {
      throw new Error(`SubAccount Id is required`);
    }

    let funnel;

    if (funnelId) {
      funnel = await prismadb.funnel.update({
        where: {
          id: funnelId,
          subAccountId,
        },
        data: {
          ...values,
        },
      });
    } else {
      funnel = await prismadb.funnel.create({
        data: {
          subAccountId,
          ...values,
        },
      });
    }

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `${funnelId ? "Updated" : "Created"} a funnel | ${
        funnel.name
      }`,
      subAccountId,
    });
  } catch (err) {
    console.log("UPSERT_FUNNEL", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const updateFunnelProducts = async ({
  subAccountId,
  funnelId,
  products,
}: {
  products: string;
  subAccountId: string;
  funnelId: string;
}) => {
  try {
    if (!subAccountId || !funnelId) {
      throw new Error(`SubAccount Id and funnel Id is required`);
    }

    const funnel = await prismadb.funnel.update({
      where: {
        id: funnelId,
        subAccountId,
      },
      data: {
        liveProducts: products,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Updated a funnel | ${funnel.name}`,
      subAccountId,
    });
  } catch (err) {
    console.log("UPDATE_FUNNEL_PRODUCTS", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const updateFunnelPagesOrder = async ({
  subAccountId,
  funnelId,
  funnelPages,
}: {
  subAccountId: string;
  funnelId: string;
  funnelPages: FunnelPage[];
}) => {
  try {
    if (!subAccountId || !funnelId) {
      throw new Error(`SubAccount Id and funnel Id is required`);
    }

    await Promise.all(
      funnelPages.map(async (funnelPage) => {
        await prismadb.funnelPage.update({
          where: {
            id: funnelPage.id,
            funnelId,
          },
          data: {
            order: funnelPage.order,
          },
        });
      }),
    );
  } catch (err) {
    console.log("UPDATE_FUNNEL_PAGES_ORDER", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const createOrUpdateFunnelPage = async ({
  subAccountId,
  funnelId,
  values,
  funnelPageId,
}: {
  subAccountId: string;
  funnelId: string;
  values: FunnelPageValidator;
  funnelPageId?: string;
}) => {
  try {
    if (!subAccountId || !funnelId) {
      throw new Error(`SubAccount Id and funnel Id is required`);
    }

    const funnel = await prismadb.funnel.findUnique({
      where: {
        id: funnelId,
        subAccountId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!funnel) {
      throw new Error(`funnel not found`);
    }

    const funnyPagesCount = await prismadb.funnelPage.count({
      where: {
        funnelId: funnel.id,
      },
    });

    if (funnelPageId) {
      const firstFunnelPage = await prismadb.funnelPage.findFirst({
        where: {
          funnelId: funnel.id,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
        },
      });

      const currentFunnelPage = await prismadb.funnelPage.findUnique({
        where: {
          id: funnelPageId,
          funnelId: funnel.id,
        },
        select: {
          id: true,
          content: true,
        },
      });

      if (currentFunnelPage?.id !== firstFunnelPage?.id && !values.pathName) {
        throw new Error(`Pathname is required`);
      }

      await prismadb.funnelPage.update({
        where: {
          id: funnelPageId,
          funnelId: funnel.id,
        },
        data: {
          ...values,
        },
      });
    } else {
      if (funnyPagesCount > 0 && !values.pathName) {
        throw new Error(`Pathname is required`);
      }

      const lastFunnelPage = await prismadb.funnelPage.findFirst({
        where: {
          funnelId: funnel.id,
        },
        select: {
          order: true,
        },
        orderBy: {
          order: "desc",
        },
      });

      const order = lastFunnelPage ? lastFunnelPage.order + 1 : 0;

      await prismadb.funnelPage.create({
        data: {
          funnelId: funnel.id,
          ...values,
          visits: 0,
          order,
          content: JSON.stringify([
            {
              content: [],
              id: "__body",
              name: "Body",
              styles: { backgroundColor: "white" },
              type: "__body",
            },
          ]),
        },
      });
    }
  } catch (err) {
    console.log("CREATE_OR_UPDATE_FUNNEL_PAGE", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const deleteFunnelPage = async ({
  subAccountId,
  funnelId,
  funnelPageId,
}: {
  subAccountId: string;
  funnelId: string;
  funnelPageId: string;
}) => {
  try {
    if (!subAccountId || !funnelId) {
      throw new Error(`Sub account Id and funnel Id are required`);
    }

    const deletedFunnelpage = await prismadb.funnelPage.delete({
      where: {
        id: funnelPageId,
        funnelId,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Deleted a funnel | ${deletedFunnelpage.name}`,
      subAccountId,
    });
  } catch (err) {
    console.log("DELETE_FUNNEL_PAGE", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const updateFunnelPageContent = async ({
  subAccountId,
  funnelId,
  funnelPageId,
  content,
}: {
  subAccountId: string;
  funnelId: string;
  funnelPageId: string;
  content: string;
}) => {
  try {
    if (!subAccountId || !funnelId) {
      throw new Error(`Sub account Id and funnel Id are required`);
    }

    const funnelpage = await prismadb.funnelPage.update({
      where: {
        id: funnelPageId,
        funnelId,
      },
      data: {
        content,
      },
    });

    await saveActivityLogNotification({
      agencyId: undefined,
      description: `Updated a funnel | ${funnelpage.name}`,
      subAccountId,
    });
  } catch (err) {
    console.log("UPDATE_FUNNEL_PAGE_CONTENT", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const getFunnelPage = async ({
  subAccountId,
  funnelId,
  funnelPageId,
}: {
  subAccountId: string;
  funnelId: string;
  funnelPageId: string;
}) => {
  try {
    if (!subAccountId || !funnelId || !funnelPageId) {
      return null;
    }

    const funnelPage = await prismadb.funnelPage.findUnique({
      where: {
        id: funnelPageId,
        funnel: {
          id: funnelId,
          subAccountId,
        },
      },
    });

    return funnelPage;
  } catch (err) {
    console.log("GET_FUNNEL_PAGE", err);

    return null;
  }
};

export const getMedia = async ({ subAccountId }: { subAccountId: string }) => {
  try {
    if (!subAccountId) {
      return [];
    }

    const allMedia = await prismadb.media.findMany({
      where: {
        subAccountId,
      },
    });

    return allMedia;
  } catch (err) {
    console.log("GET_MEDIA", err);

    return [];
  }
};

export const getFunnel = async ({
  subAccountId,
  funnelId,
}: {
  subAccountId: string;
  funnelId: string;
}) => {
  try {
    if (!subAccountId || !funnelId) {
      return null;
    }

    const funnel = await prismadb.funnel.findUnique({
      where: {
        id: funnelId,
        subAccountId,
      },
      select: {
        id: true,
        subDomainName: true,
        liveProducts: true,
        funnelPages: {
          select: {
            id: true,
            order: true,
            pathName: true,
          },
        },
      },
    });

    return funnel;
  } catch (err) {
    console.log("GET_FUNNEL", err);

    return null;
  }
};

export const getSubaccountConnectedId = async ({
  subAccountId,
}: {
  subAccountId: string;
}) => {
  try {
    if (!subAccountId) {
      return null;
    }

    const subaccount = await prismadb.subAccount.findUnique({
      where: {
        id: subAccountId,
      },
      select: {
        id: true,
        connectAccountId: true,
      },
    });

    return subaccount;
  } catch (err) {
    console.log("GET_SUBACCOUNT_CONNECTED_ID", err);

    return null;
  }
};

export const getDomainContent = async ({
  subDomainName,
}: {
  subDomainName: string;
}) => {
  try {
    if (!subDomainName) {
      return null;
    }

    const domainContent = await prismadb.funnel.findUnique({
      where: {
        subDomainName,
      },
      select: {
        id: true,
        subAccountId: true,
        funnelPages: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return domainContent;
  } catch (err) {
    console.log("GET_DOMAIN_CONTENT", err);

    return null;
  }
};
