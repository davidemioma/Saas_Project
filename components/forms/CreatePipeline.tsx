"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Pipeline } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrUpdatePipeline, deletePipeline } from "@/data/queries";
import { PipelineValidator, PipelineSchema } from "@/lib/validators/pipeline";
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
  defaultPipeline?: Pipeline;
  onClose?: () => void;
};

const CreatePipeline = ({ subAccountId, defaultPipeline, onClose }: Props) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const form = useForm<PipelineValidator>({
    resolver: zodResolver(PipelineSchema),
    defaultValues: {
      name: defaultPipeline?.name || "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: PipelineValidator) => {
    if (!subAccountId) {
      onClose && onClose();

      return;
    }

    try {
      await createOrUpdatePipeline({
        subAccountId,
        values,
        pipelineId: defaultPipeline?.id,
      });

      toast.success("Pipeline created");

      onClose && onClose();

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! Could not create pipline.");
    }
  };

  const onDelete = async () => {
    if (!subAccountId || !defaultPipeline?.id) {
      setOpen(false);

      return;
    }

    setDeleting(true);

    try {
      await deletePipeline({
        subAccountId,
        pipelineId: defaultPipeline?.id,
      });

      toast.success("Pipeline deleted");

      setOpen(false);

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! Could not delete pipline.");
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
              pipeline from our servers.
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
          <CardTitle>Pipeline Details</CardTitle>
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
                    <FormLabel>Pipeline Name</FormLabel>

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
                  {isLoading ? <Loader /> : defaultPipeline ? "Save" : "Create"}
                </Button>

                {defaultPipeline && (
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

export default CreatePipeline;
