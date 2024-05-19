"use client";

import React from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { TicketProps } from "@/types";
import TagCreator from "../TagCreator";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User2, ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import { TicketValidator, TicketSchema } from "@/lib/validators/ticket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSearchedContacts, getSubAccountTeamMembers } from "@/data/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

type Props = {
  laneId: string;
  subaccountId: string;
  defaultTicket?: TicketProps;
  onClose?: () => void;
};

const TicketForm = ({
  laneId,
  subaccountId,
  defaultTicket,
  onClose,
}: Props) => {
  const router = useRouter();

  const form = useForm<TicketValidator>({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      name: defaultTicket?.name || "",
      description: defaultTicket?.description || "",
      value: defaultTicket?.value || 0,
      assignedUserId: defaultTicket?.assignedUserId || "",
      customerId: defaultTicket?.customerId || "",
    },
  });

  const {
    data: allTeamMembers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-subaccount-team-members", subaccountId],
    queryFn: async () => {
      const teamMembers = await getSubAccountTeamMembers(subaccountId);

      return teamMembers;
    },
  });

  const currContact = form.getValues("customerId");

  const {
    data: contacts,
    isLoading: contactsLoading,
    isError: contactsError,
  } = useQuery({
    queryKey: ["get-searched-contacts", defaultTicket?.Customer?.name],
    queryFn: async () => {
      const contacts = await getSearchedContacts(
        defaultTicket?.Customer?.name || ""
      );

      return contacts;
    },
  });

  const { mutate: upsertTicket, isPending } = useMutation({
    mutationKey: ["upsert-ticket", defaultTicket?.id],
    mutationFn: async () => {},
    onSuccess: () => {
      toast.success(`Ticket ${defaultTicket ? "updated" : "created"}.`);

      onClose && onClose();

      router.refresh();
    },
    onError: (err) => {
      toast.error(
        `Something went wrong! could not ${
          defaultTicket ? "update" : "create"
        } ticket.`
      );
    },
  });

  const onSubmit = async (values: TicketValidator) => {
    if (!laneId) return;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Name</FormLabel>

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
                <FormItem>
                  <FormLabel>Description</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Description"
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
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Value</FormLabel>

                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Value"
                      {...field}
                      min={0}
                      step="0.01"
                      disabled={isPending}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="font-bold">Add Tags</h3>

            <TagCreator
              subAccountId={subaccountId}
              defaultTags={defaultTicket?.tags || []}
            />

            <FormField
              control={form.control}
              name="assignedUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To Team Member</FormLabel>

                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage alt="contact" />

                                  <AvatarFallback className="bg-primary text-sm text-white">
                                    <User2 size={12} />
                                  </AvatarFallback>
                                </Avatar>

                                <span className="text-sm text-muted-foreground">
                                  Not Assigned
                                </span>
                              </div>
                            }
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {isLoading && (
                          <div className="py-4">
                            <Loader />
                          </div>
                        )}

                        {allTeamMembers?.length === 0 && (
                          <div className="flex items-center justify-center py-4 text-sm">
                            No category found! Create a new category.
                          </div>
                        )}

                        {!isLoading && !isError && allTeamMembers && (
                          <>
                            {allTeamMembers?.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage
                                      alt="contact"
                                      src={member.avatarUrl}
                                    />

                                    <AvatarFallback className="bg-primary text-sm text-white">
                                      <User2 size={12} />
                                    </AvatarFallback>
                                  </Avatar>

                                  <span className="text-sm text-muted-foreground">
                                    {member.name}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {contacts && !contactsLoading && !contactsError && (
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Customer</FormLabel>

                    <Popover>
                      <PopoverTrigger asChild className="w-full">
                        <Button
                          variant="outline"
                          role="combobox"
                          className="justify-between"
                        >
                          {currContact
                            ? contacts.find(
                                (contact) => contact.id === currContact
                              )?.name
                            : "Select Customer..."}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-[250px] p-0">
                        <Command>
                          <CommandInput placeholder="Search language..." />

                          <CommandEmpty>No Customer found.</CommandEmpty>

                          <CommandGroup>
                            {contacts.map((contact) => (
                              <CommandItem
                                key={contact.id}
                                value={contact.id}
                                onSelect={() => {
                                  form.setValue("customerId", contact.id);
                                }}
                              >
                                {contact.name}

                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    currContact === contact.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              className="w-20 mt-4"
              disabled={isPending || isLoading || contactsLoading}
              type="submit"
            >
              {isPending ? <Loader /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;
