"use client";

import React from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FileUpload from "../FileUpload";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createMedia } from "@/data/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { MediaValidator, MediaSchema } from "@/lib/validators/media";
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
  subAccountId: string;
  onClose?: () => void;
};

const UploadMediaForm = ({ subAccountId, onClose }: Props) => {
  const router = useRouter();

  const form = useForm<MediaValidator>({
    resolver: zodResolver(MediaSchema),
    defaultValues: {
      link: "",
      name: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: MediaValidator) => {
    try {
      await createMedia({ subAccountId, values });

      toast.success("Media Uploaded!");

      onClose && onClose();

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! Could not uploaded media");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Information</CardTitle>

        <CardDescription>
          Please enter the details for your file
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>File Name</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Your file name"
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
              name="link"
              disabled={isLoading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media File</FormLabel>

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

            <div className="w-full flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader /> : "Upload Media"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UploadMediaForm;
