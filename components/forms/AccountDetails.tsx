"use client";

import React, { useState } from "react";
import { v4 } from "uuid";
import { toast } from "sonner";
import Loader from "../Loader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import { Switch } from "@/components/ui/switch";
import { Role, SubAccount } from "@prisma/client";
import { AuthUser, PermissionProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountValidator, AccountSchema } from "@/lib/validators/account";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  changeUserPermissions,
  saveActivityLogNotification,
  updateAccountRole,
} from "@/data/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

type Props = {
  id: string;
  type: "agency" | "subaccount";
  authUserRole: Role | undefined;
  userData: Partial<AuthUser | null>;
  subAccounts?: SubAccount[];
  subAccountsPermissions?: PermissionProps[];
  onClose?: () => void;
};

const AccountDetails = ({
  id,
  type,
  authUserRole,
  userData,
  subAccounts,
  subAccountsPermissions,
  onClose,
}: Props) => {
  const router = useRouter();

  const [roleState, setRoleState] = useState("");

  const [changingPermission, setChangingPermission] = useState(false);

  const form = useForm<AccountValidator>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      role: userData?.role || "SUBACCOUNT_USER",
    },
  });

  const isLoading = form.formState.isSubmitting || changingPermission;

  const onChangePermission = async ({
    subAccountId,
    access,
    permissionsId,
  }: {
    subAccountId: string;
    access: boolean;
    permissionsId: string | undefined;
  }) => {
    if (!userData?.email) {
      toast.info("Your Email is required");

      return;
    }

    if (!userData?.agencyId || !userData?.name) {
      toast.info("Agency is required");

      return;
    }

    setChangingPermission(true);

    try {
      await changeUserPermissions({
        permissionsId: permissionsId || v4(),
        agencyId: userData?.agencyId,
        adminOwnerName: userData?.name,
        subAccountId,
        email: userData.email,
        access,
        type,
      });

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! Could not change permission.");
    } finally {
      setChangingPermission(false);
    }
  };

  const onSubmit = async (values: AccountValidator) => {
    if (!id || !userData?.id) return;

    try {
      await updateAccountRole({
        agencyId: id,
        userId: userData.id,
        values,
      });

      const subAccsWithPermissiom =
        userData?.agency?.subAccounts.filter((subacc) =>
          userData.permissions?.find(
            (p) => p.subAccountId === subacc.id && p.access
          )
        ) || [];

      await Promise.all(
        subAccsWithPermissiom?.map(async (subAccount) => {
          await saveActivityLogNotification({
            agencyId: undefined,
            subAccountId: subAccount.id,
            description: `Updated ${userData?.name} information`,
          });
        })
      );

      toast.success("Updated User Information");

      onClose && onClose();

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! Could not update user information.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>

        <CardDescription>
          Lets create an agency for you business. You can edit agency settings
          later from the agency settings tab.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <Avatar className="w-40 h-40 mx-auto">
              <AvatarImage src={userData?.avatarUrl} />

              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Full Name</FormLabel>

                    <FormControl>
                      <Input
                        readOnly={true}
                        placeholder="Your full name"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <Input readOnly={true} placeholder="Email" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User Role</FormLabel>

                  <Select
                    defaultValue={field.value}
                    onValueChange={(value: Role) => {
                      if (
                        value === "SUBACCOUNT_USER" ||
                        value === "SUBACCOUNT_GUEST"
                      ) {
                        setRoleState(
                          "You need to have subaccounts to assign Subaccount access to team members."
                        );
                      } else {
                        setRoleState("");
                      }

                      field.onChange(value);
                    }}
                    disabled={field.value === "AGENCY_OWNER" || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>

                      {userData?.role === "AGENCY_OWNER" && (
                        <SelectItem value="AGENCY_OWNER">
                          Agency Owner
                        </SelectItem>
                      )}

                      <SelectItem value="SUBACCOUNT_USER">
                        Sub Account User
                      </SelectItem>

                      <SelectItem value="SUBACCOUNT_GUEST">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-muted-foreground">{roleState}</p>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {form.formState.isSubmitting ? <Loader /> : "Save User Details"}
            </Button>
          </form>
        </Form>

        {authUserRole && authUserRole === "AGENCY_OWNER" && (
          <div>
            <Separator className="my-4" />

            <h3 className="text-lg font-bold">User Permissions</h3>

            <p className="mb-4 text-sm my-3">
              You can give Sub Account access to team member by turning on
              access control for each Sub Account. This is only visible to
              agency owners
            </p>

            <div className="flex flex-col gap-4">
              {subAccounts?.map((subAccount) => {
                const subAccountPermissionsDetails =
                  subAccountsPermissions?.find(
                    (p) => p.subAccountId === subAccount.id
                  );

                return (
                  <div
                    key={subAccount.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p>{subAccount.name}</p>
                    </div>

                    <Switch
                      type="button"
                      disabled={isLoading}
                      checked={subAccountPermissionsDetails?.access}
                      onCheckedChange={(access: boolean) =>
                        onChangePermission({
                          access,
                          subAccountId: subAccount.id,
                          permissionsId: subAccountPermissionsDetails?.id,
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountDetails;
