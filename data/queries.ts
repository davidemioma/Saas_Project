"use server";

import prismadb from "@/lib/prisma";
import { User } from "@prisma/client";
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
    throw new Error("Something went wrong!");
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
