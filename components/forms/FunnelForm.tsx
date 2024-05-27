"use client";

import React from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FileUpload from "../FileUpload";
import { Funnel } from "@prisma/client";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrUpdateFunnel } from "@/data/queries";
import { FunnelValidator, FunnelSchema } from "@/lib/validators/funnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  subAccountId: string;
  defaultData?: Funnel;
  onClose?: () => void;
};

const FunnelForm = ({ subAccountId, defaultData, onClose }: Props) => {
  const router = useRouter();

  const form = useForm<FunnelValidator>({
    resolver: zodResolver(FunnelSchema),
    defaultValues: {
      name: defaultData?.name || "",
      description: defaultData?.description || "",
      favicon: defaultData?.favicon || "",
      subDomainName: defaultData?.subDomainName || "",
    },
  });

  const { mutate: upsertFunnel, isPending } = useMutation({
    mutationKey: ["upsert-funnel", defaultData?.id],
    mutationFn: async (values: FunnelValidator) => {
      await createOrUpdateFunnel({
        subAccountId,
        funnelId: defaultData?.id,
        values,
      });
    },
    onSuccess: () => {
      toast.success(
        `Funnel ${defaultData ? "updated" : "created"} successfully!`
      );

      onClose && onClose();

      router.refresh();
    },
    onError: (err) => {
      toast.error(
        `Could not ${
          defaultData ? "updated" : "created"
        } your funnel! Try again later.`
      );
    },
  });

  const onSubmit = async (values: FunnelValidator) => {
    if (!subAccountId) return;

    upsertFunnel(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Funnel Details</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Funnel Name</FormLabel>

                  <FormControl>
                    <Input placeholder="Name" {...field} disabled={isPending} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Funnel Description</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit more about this funnel."
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
              name="subDomainName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Sub domain</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Sub domain for funnel"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isPending}
              control={form.control}
              name="favicon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon</FormLabel>

                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end mt-4">
              <Button type="submit" className="w-20" disabled={isPending}>
                {isPending ? <Loader /> : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FunnelForm;
