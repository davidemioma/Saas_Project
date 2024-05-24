"use client";

import React, { useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import FileUpload from "../FileUpload";
import { Agency } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { NumberInput } from "@tremor/react";
import { useRouter } from "next/navigation";
import AlertModal from "../modals/AlertModal";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgencySchema, AgencyValidator } from "@/lib/validators/agency";
import {
  updateAgencyDetails,
  saveActivityLogNotification,
  deleteAgency,
  initUser,
  createOrUpdateAgency,
} from "@/data/queries";
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
  FormDescription,
} from "../ui/form";

type Props = {
  data?: Partial<Agency>;
};

const AgencyDetails = ({ data }: Props) => {
  const router = useRouter();

  const { user } = useUser();

  const [open, setOpen] = useState(false);

  const form = useForm<AgencyValidator>({
    resolver: zodResolver(AgencySchema),
    defaultValues: {
      name: data?.name || "",
      companyEmail:
        data?.companyEmail || user?.emailAddresses[0].emailAddress || "",
      companyPhone: data?.companyPhone || "",
      whiteLabel: data?.whiteLabel || false,
      address: data?.address || "",
      city: data?.city || "",
      zipCode: data?.zipCode || "",
      state: data?.state || "",
      country: data?.country || "",
      agencyLogo: data?.agencyLogo || "",
    },
  });

  const { mutate: upsertAgency, isPending } = useMutation({
    mutationKey: ["upsert-agency", data?.id],
    mutationFn: async (values: AgencyValidator) => {
      let customerId;

      if (!data?.id) {
        //Create a stripe customer
        const bodyData = {
          name: values.name,
          email: values.companyEmail,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          },
        };

        const res = await axios.post("/api/stripe/create-customer", bodyData);

        customerId = res.data.customerId;
      }

      await initUser({ role: "AGENCY_OWNER" });

      if (!data?.customerId && !customerId) return;

      await createOrUpdateAgency({
        customerId,
        values,
      });
    },
    onSuccess: () => {
      toast.success(`Agency ${data?.id ? "Updated" : "Created"}!`);

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not create your agency! Try again later.");
    },
  });

  const { mutate: onDeleteAgency, isPending: deletingAgency } = useMutation({
    mutationKey: ["delete-agency"],
    mutationFn: async () => {
      if (!data?.id) return;

      await deleteAgency({ agencyId: data.id });
    },
    onSuccess: () => {
      toast.success("Agency deleted successfully!");

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not delete your agency! Try again later.");
    },
  });

  const onSubmit = async (values: AgencyValidator) => {
    upsertAgency(values);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDeleteAgency}
        loading={deletingAgency}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>

          <CardDescription>
            Lets create an agency for you business. You can edit agency settings
            later from the agency settings tab.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="agencyLogo"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>

                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
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
                      <FormLabel>Agency Name</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Your agency name"
                          {...field}
                          disabled={isPending}
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
                      <FormLabel>Agency Email</FormLabel>

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
                      <FormLabel>Agency Phone Number</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Phone"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="whiteLabel"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Whitelabel Agency
                      </FormLabel>

                      <FormDescription>
                        Turning on whilelabel mode will show your agency logo to
                        all sub accounts by default. You can overwrite this
                        functionality through sub account settings.
                      </FormDescription>
                    </div>

                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                        disabled={isPending}
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
                          disabled={isPending}
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
                          disabled={isPending}
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
                          disabled={isPending}
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
                        disabled={isPending}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {data?.id && (
                <div className="flex flex-col gap-2">
                  <FormLabel>Create A Goal</FormLabel>

                  <FormDescription>
                    ✨ Create a goal for your agency. As your business grows
                    your goals grow too so dont forget to set the bar higher!
                  </FormDescription>

                  <NumberInput
                    defaultValue={data?.goal}
                    className="bg-background border border-input"
                    placeholder="Sub Account Goal"
                    min={1}
                    onValueChange={async (value) => {
                      if (!data?.id) return;

                      await updateAgencyDetails({
                        agencyId: data.id,
                        agencyDetail: {
                          goal: value,
                        },
                      });

                      await saveActivityLogNotification({
                        agencyId: data.id,
                        description: `Updated the agency goal to | ${value} Sub Account`,
                        subAccountId: undefined,
                      });

                      router.refresh();
                    }}
                  />
                </div>
              )}

              <Button type="submit" disabled={isPending || deletingAgency}>
                {isPending ? <Loader /> : "Save Agency Information"}
              </Button>
            </form>
          </Form>

          {data?.id && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
              <div className="text-muted-foreground text-sm">
                Deleting your agency cannpt be undone. This will also delete all
                sub accounts and all data related to your sub accounts. Sub
                accounts will no longer have access to funnels, contacts etc.
              </div>

              <Button
                onClick={() => setOpen(true)}
                variant="destructive"
                type="button"
                disabled={isPending || deletingAgency}
              >
                Delete Agency
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AgencyDetails;
