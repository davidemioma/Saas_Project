"use server";

import { v4 } from "uuid";
import { toast } from "sonner";
import prismadb from "@/lib/prisma";
import { LaneProps } from "@/types";
import { UserValidator } from "@/lib/validators/user";
import { MediaValidator } from "@/lib/validators/media";
import { Agency, SubAccount, Ticket, User } from "@prisma/client";
import { PipelineValidator } from "@/lib/validators/pipeline";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { InvitationValidator } from "@/lib/validators/invitation";
import { LaneValidator } from "@/lib/validators/lane";

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
          "You need to provide at least an agency ID or a sub account ID!"
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
        "You need to provide at least an agency ID or a sub account ID!"
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

export const createOrUpdateAgency = async (agency: Agency) => {
  try {
    if (!agency.companyEmail) return null;

    const agencyDetail = await prismadb.agency.upsert({
      where: {
        id: agency.id,
      },
      update: {
        ...agency,
      },
      create: {
        ...agency,
        users: {
          connect: {
            email: agency.companyEmail,
          },
        },
        sidebarOptions: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });

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
  subAccount,
  userName,
}: {
  subAccount: SubAccount;
  userName: string;
}) => {
  try {
    if (!subAccount.companyEmail) return null;

    const agencyOwner = await prismadb.user.findFirst({
      where: {
        agency: {
          id: subAccount.agencyId,
        },
        role: "AGENCY_OWNER",
      },
    });

    if (!agencyOwner) {
      throw new Error("Error, Could not find agency owner!");
    }

    const permissionId = v4();

    const res = await prismadb.subAccount.upsert({
      where: {
        id: subAccount.id,
      },
      update: {
        ...subAccount,
      },
      create: {
        ...subAccount,
        permissions: {
          create: {
            id: permissionId,
            access: true,
            email: agencyOwner.email,
          },
          connect: {
            id: permissionId,
            subAccountId: subAccount.id,
          },
        },
        pipelines: {
          create: { name: "Lead Cycle" },
        },
        sidebarOptions: {
          create: [
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/subaccount/${subAccount.id}/launchpad`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/subaccount/${subAccount.id}/settings`,
            },
            {
              name: "Funnels",
              icon: "pipelines",
              link: `/subaccount/${subAccount.id}/funnels`,
            },
            {
              name: "Media",
              icon: "database",
              link: `/subaccount/${subAccount.id}/media`,
            },
            {
              name: "Automations",
              icon: "chip",
              link: `/subaccount/${subAccount.id}/automations`,
            },
            {
              name: "Pipelines",
              icon: "flag",
              link: `/subaccount/${subAccount.id}/pipelines`,
            },
            {
              name: "Contacts",
              icon: "person",
              link: `/subaccount/${subAccount.id}/contacts`,
            },
            {
              name: "Dashboard",
              icon: "category",
              link: `/subaccount/${subAccount.id}`,
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

    await saveActivityLogNotification({
      agencyId: res.agencyId,
      subAccountId: res.id,
      description: `${userName} | updated sub account | ${res.name}`,
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
        "Unauthorised, You need to be logged in to perform this action"
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
  subAccountId: string | null | undefined
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

    const lanesCount = await prismadb.lane.count({
      where: {
        pipelineId,
      },
    });

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
      lane = await prismadb.lane.create({
        data: {
          pipelineId,
          order: lanesCount,
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

export const updateLaneOrder = async (lanes: LaneProps[]) => {
  try {
    await Promise.all(
      lanes.map(async (lane) => {
        await prismadb.lane.update({
          where: {
            id: lane.id,
          },
          data: {
            order: lane.order,
          },
        });
      })
    );
  } catch (err) {
    console.log("UPDATE_LANE_ORDER", err);

    throw new Error(`Something went wrong ${err}`);
  }
};

export const updateTicketOrder = async (tickets: Ticket[]) => {
  try {
    await Promise.all(
      tickets.map(async (ticket) => {
        await prismadb.ticket.update({
          where: {
            id: ticket.id,
          },
          data: {
            order: ticket.order,
          },
        });
      })
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
