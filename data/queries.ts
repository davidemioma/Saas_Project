"use server";

import { toast } from "sonner";
import prismadb from "@/lib/prisma";
import { Agency, User } from "@prisma/client";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

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

      if (newUser) {
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

        return newUser.agencyId;
      } else {
        return null;
      }
    } else {
      const userDetails = await prismadb.user.findUnique({
        where: {
          email: user.emailAddresses[0].emailAddress,
        },
        select: {
          agencyId: true,
        },
      });

      return userDetails?.agencyId || null;
    }
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
