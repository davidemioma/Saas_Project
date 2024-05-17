"use client";

import React from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { sendInvite } from "@/data/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InvitationValidator,
  InvitationSchema,
} from "@/lib/validators/invitation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

type Props = {
  agencyId: string;
};

const SendInvitation = ({ agencyId }: Props) => {
  const form = useForm<InvitationValidator>({
    resolver: zodResolver(InvitationSchema),
    defaultValues: {
      email: "",
      role: "SUBACCOUNT_USER",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: InvitationValidator) => {
    try {
      await sendInvite({ agencyId, values });

      toast.success("invitation sent.");
    } catch (err) {
      toast.error("Something went wrong! Could not send invitation.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-1">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Email</FormLabel>

              <FormControl>
                <Input {...field} placeholder="Email" disabled={isLoading} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>User Role</FormLabel>

              <Select
                defaultValue={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role..." />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectItem value="AGENCY_ADMING">Agency Admin</SelectItem>

                  <SelectItem value="SUBACCOUNT_USER">
                    Sub Account User
                  </SelectItem>

                  <SelectItem value="SUBACCOUNT_GUEST">
                    Sub Account Guest
                  </SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader /> : "Send Invitation"}
        </Button>
      </form>
    </Form>
  );
};

export default SendInvitation;
