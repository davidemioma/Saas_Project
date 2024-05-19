"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Lane } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrUpdateLane, deleteLane } from "@/data/queries";
import { LaneValidator, LaneSchema } from "@/lib/validators/lane";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  subAccountId: string;
  pipelineId: string;
  defaultLane?: Lane;
  onClose?: () => void;
};

const CreateLane = ({
  subAccountId,
  pipelineId,
  defaultLane,
  onClose,
}: Props) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const form = useForm<LaneValidator>({
    resolver: zodResolver(LaneSchema),
    defaultValues: {
      name: defaultLane?.name || "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: LaneValidator) => {
    if (!subAccountId) {
      onClose && onClose();

      return;
    }

    try {
      await createOrUpdateLane({
        subAccountId,
        laneId: defaultLane?.id,
        pipelineId,
        values,
      });

      toast.success(`Lane ${defaultLane ? "updated" : "created"}`);

      onClose && onClose();

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! Could not create lane.");
    }
  };

  const onDelete = async () => {
    if (!subAccountId || !defaultLane?.id) {
      setOpen(false);

      return;
    }

    setDeleting(true);

    try {
      await deleteLane({ laneId: defaultLane.id, pipelineId, subAccountId });

      toast.success("Lane deleted");

      setOpen(false);

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! Could not delete lane.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={() => setOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              lane from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen(false)}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={onDelete} disabled={deleting}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lane Details</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lane Name</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 mt-4">
                <Button type="submit" className="w-20" disabled={isLoading}>
                  {isLoading ? <Loader /> : defaultLane ? "Save" : "Create"}
                </Button>

                {defaultLane && (
                  <Button
                    type="button"
                    className="w-20"
                    variant="destructive"
                    disabled={isLoading}
                    onClick={() => setOpen(true)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default CreateLane;
