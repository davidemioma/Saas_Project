"use client";

import React from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Contact } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrUpdateContact } from "@/data/queries";
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
  subAccountId: string;
  defaultData?: Contact;
  onClose?: () => void;
};

const ContactUserForm = ({ subAccountId, defaultData, onClose }: Props) => {
  const router = useRouter();

  const form = useForm<ContactValidator>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: defaultData?.name || "",
      email: defaultData?.email || "",
    },
  });

  const { mutate: upsertContact, isPending } = useMutation({
    mutationKey: ["upsert-contact", defaultData?.id],
    mutationFn: async (values: ContactValidator) => {
      await createOrUpdateContact({
        subAccountId,
        values,
      });
    },
    onSuccess: () => {
      toast.success(`Contact ${defaultData ? "updated" : "created"}.`);

      onClose && onClose();

      router.refresh();
    },
    onError: (err) => {
      toast.error(
        `Something went wrong! could not ${
          defaultData ? "update" : "create"
        } contact.`
      );
    },
  });

  const onSubmit = async (values: ContactValidator) => {
    if (!subAccountId) return;

    upsertContact(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contact Info</CardTitle>

        <CardDescription>
          You can assign tickets to contacts and set a value for each contact in
          the ticket.
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

            <div className="w-full flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader /> : "Save Contact Details"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactUserForm;
