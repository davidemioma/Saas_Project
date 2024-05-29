"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FunnelPage } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, CopyPlusIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrUpdateFunnelPage, deleteFunnelPage } from "@/data/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FunnelPageValidator,
  FunnelPageSchema,
} from "@/lib/validators/funnel-page";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  subaccountId: string;
  funnelId: string;
  funnelLength: number;
  defaultData?: FunnelPage;
  onClose?: () => void;
};

const CreateFunnelPage = ({
  subaccountId,
  funnelId,
  defaultData,
  onClose,
  funnelLength,
}: Props) => {
  const router = useRouter();

  const form = useForm<FunnelPageValidator>({
    resolver: zodResolver(FunnelPageSchema),
    defaultValues: {
      name: defaultData?.name || "",
      pathName: defaultData?.pathName || "",
    },
  });

  useEffect(() => {
    if (defaultData) {
      form.reset({ name: defaultData.name, pathName: defaultData.pathName });
    }
  }, [defaultData]);

  const { mutate: upsertFunnelPage, isPending } = useMutation({
    mutationKey: ["upsert-funnel-page", defaultData?.id],
    mutationFn: async (values: FunnelPageValidator) => {
      await createOrUpdateFunnelPage({
        subAccountId: subaccountId,
        funnelId,
        values,
        funnelPageId: defaultData?.id,
      });
    },
    onSuccess: () => {
      toast.success(`Funnel page ${defaultData?.id ? "Updated" : "Created"}!`);

      onClose && onClose();

      router.refresh();
    },
    onError: (err) => {
      if (err.message === "Something went wrong Error: Pathname is required") {
        toast(
          "Pages other than the first page in the funnel require a pathname!"
        );
      } else {
        toast.error(
          `Could not ${
            defaultData?.id ? "update" : "create"
          } funnel page! Try again later.`
        );
      }
    },
  });

  const { mutate: copyFunnelPage, isPending: copying } = useMutation({
    mutationKey: ["copy-funnel-page", defaultData?.id],
    mutationFn: async () => {
      if (!defaultData?.id) return;

      await createOrUpdateFunnelPage({
        subAccountId: subaccountId,
        funnelId,
        values: {
          name: `${defaultData.name} Copy`,
          pathName: `${defaultData.pathName}copy`,
        },
      });
    },
    onSuccess: () => {
      toast.success("Funnel page copyed!");

      onClose && onClose();

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not copy funnel page! Try again later.");
    },
  });

  const { mutate: onDeleteFunnelPage, isPending: deleting } = useMutation({
    mutationKey: ["delete-funnel-page"],
    mutationFn: async () => {
      if (!defaultData?.id) return;

      await deleteFunnelPage({
        subAccountId: subaccountId,
        funnelId,
        funnelPageId: defaultData.id,
      });
    },
    onSuccess: () => {
      toast.success("Funnel page deleted!");

      onClose && onClose();

      router.refresh();
    },
    onError: (err) => {
      toast.error("Could not delete funnel page! Try again later.");
    },
  });

  const onSubmit = async (values: FunnelPageValidator) => {
    if (!funnelId || !subaccountId) return;

    upsertFunnelPage(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Funnel Page</CardTitle>

        <CardDescription>
          Funnel pages are flow in the order they are created by default. You
          can move them around to change their order.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                      disabled={isPending || deleting || copying}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pathName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Path Name</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Path for the page"
                      {...field}
                      disabled={isPending || deleting || copying}
                      value={field.value?.toLowerCase()}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                className="w-20"
                type="submit"
                disabled={isPending || deleting || copying}
              >
                {isPending ? <Loader /> : "Save"}
              </Button>

              {defaultData?.id && (
                <Button
                  className="w-20"
                  type="button"
                  variant="destructive"
                  disabled={isPending || deleting || copying}
                  onClick={() => onDeleteFunnelPage()}
                >
                  {deleting ? <Loader /> : <Trash />}
                </Button>
              )}

              {defaultData?.id && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isPending || deleting || copying}
                  onClick={() => copyFunnelPage()}
                >
                  {copying ? <Loader /> : <CopyPlusIcon />}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateFunnelPage;
