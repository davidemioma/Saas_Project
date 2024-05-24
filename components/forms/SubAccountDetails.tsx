"use client";

import React from "react";
import Loader from "../Loader";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AgencyProps } from "@/types";
import FileUpload from "../FileUpload";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SubAccount } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrUpdateSubAccount } from "@/data/queries";
import {
  SubAccountSchema,
  SubAccountValidator,
} from "@/lib/validators/subaccount";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

type Props = {
  userName: string;
  onClose?: () => void;
  agencyDetails: AgencyProps;
  details?: Partial<SubAccount>;
};

const SubAccountDetails = ({
  agencyDetails,
  details,
  userName,
  onClose,
}: Props) => {
  const router = useRouter();

  const { user } = useUser();

  const form = useForm<SubAccountValidator>({
    resolver: zodResolver(SubAccountSchema),
    defaultValues: {
      name: details?.name || "",
      companyEmail:
        details?.companyEmail || user?.emailAddresses[0].emailAddress || "",
      companyPhone: details?.companyPhone || "",
      address: details?.address || "",
      city: details?.city || "",
      zipCode: details?.zipCode || "",
      state: details?.state || "",
      country: details?.country || "",
      subAccountLogo: details?.subAccountLogo || "",
    },
  });

  const { mutate: upsertSubAccount, isPending: isLoading } = useMutation({
    mutationKey: ["upsert-subAccount", details?.id],
    mutationFn: async ({
      values,
      agencyId,
    }: {
      values: SubAccountValidator;
      agencyId: string;
    }) => {
      await createOrUpdateSubAccount({
        values,
        agencyId,
        userName,
        subAccountId: details?.id,
      });
    },
    onSuccess: () => {
      toast.success(`Sub account ${details?.id ? "Updated" : "Created"}!`);

      onClose && onClose();

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not create your sub account! Try again later.");
    },
  });

  const onSubmit = async (values: SubAccountValidator) => {
    if (!agencyDetails?.id) {
      toast.error("You need an agency to create a new Sub Account!");

      return;
    }

    upsertSubAccount({ values, agencyId: agencyDetails?.id });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sub Account Information</CardTitle>

        <CardDescription>Please enter business details</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="subAccountLogo"
              disabled={isLoading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Logo</FormLabel>

                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Name</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Your account name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Email</FormLabel>

                    <FormControl>
                      <Input readOnly placeholder="Email" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Account Phone Number</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Phone"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Address</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="123 st..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="City"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="State"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Zipcpde</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Zipcode"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Country</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Country"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader /> : "Save Account Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubAccountDetails;
