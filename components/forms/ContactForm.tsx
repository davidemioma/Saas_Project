"use client";

import React from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrUpdateContact } from "@/data/queries";
import { useEditor } from "@/providers/editor/editor-provider";
import { ContactValidator, ContactSchema } from "@/lib/validators/contact";
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
} from "@/components/ui/form";

type Props = {
  title: string;
  subTitle: string;
  subAccountId: string;
  goToNextPage: () => void;
};

const ContactForm = ({
  title,
  subTitle,
  subAccountId,
  goToNextPage,
}: Props) => {
  const { state } = useEditor();

  const form = useForm<ContactValidator>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const { mutate: createContact, isPending } = useMutation({
    mutationKey: ["create-component-contact"],
    mutationFn: async (values: ContactValidator) => {
      await createOrUpdateContact({
        subAccountId,
        values,
      });
    },
    onSuccess: () => {
      toast.success("Contact created!");

      goToNextPage();
    },
    onError: (err) => {
      toast.error("Something went wrong! could not create contact.");
    },
  });

  const onSubmit = async (values: ContactValidator) => {
    if (!state.editor.liveMode) {
      toast.info("You can only add contact in live mode.");

      return;
    }

    createContact(values);
  };

  return (
    <Card className="w-[500px] max-w-[500px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>

        <CardDescription>{subTitle}</CardDescription>
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
                    <Input placeholder="Name" {...field} disabled={isPending} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex w-full justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader /> : "Get a free quote!"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
