"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Loader from "../Loader";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { TicketProps } from "@/types";
import TagCreator from "../TagCreator";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User2, ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import { TicketValidator, TicketSchema } from "@/lib/validators/ticket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createAndUpdateTicket,
  getSearchedContacts,
  getSubAccountTeamMembers,
} from "@/data/queries";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  const [openPopover, setOpenPopover] = useState(false);

  const [input, setInput] = useState(defaultTicket?.Customer?.name || "");

  const [searchValue, setSearchValue] = useState(input);

  useEffect(() => {
    const inputTimeout = setTimeout(() => {
      setSearchValue(input);
    }, 1000);

    return () => {
      clearTimeout(inputTimeout);
    };
  }, [input]);

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

  const {
    data: contacts,
    isLoading: contactsLoading,
    isError: contactsError,
    refetch,
  } = useQuery({
    queryKey: ["get-searched-contacts", searchValue],
    queryFn: async () => {
      const contacts = await getSearchedContacts(searchValue);

      return contacts;
    },
  });

  const { mutate: upsertTicket, isPending } = useMutation({
    mutationKey: ["upsert-ticket", defaultTicket?.id],
    mutationFn: async (values: TicketValidator) => {
      await createAndUpdateTicket({
        subAccountId: subaccountId,
        laneId,
        ticketId: defaultTicket?.id,
        values,
      });
    },
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

    upsertTicket(values);
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
              defaultTags={defaultTicket?.tags}
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
                            No Team member found!.
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

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Customer</FormLabel>

                  <Popover open={openPopover} onOpenChange={setOpenPopover}>
                    <PopoverTrigger className="w-full">
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {field.value
                            ? contacts?.find(
                                (contact) => contact.id === field.value
                              )?.name
                            : "Select Customer..."}

                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-[250px] p-0" align="end">
                      <div className="w-full">
                        <input
                          className="h-9 w-full px-2 border-0 border-b outline-none text-sm"
                          placeholder="Search..."
                          value={input}
                          onChange={(e) => {
                            setInput(e.target.value);
                          }}
                        />

                        {!contactsLoading && !contactsError && !contacts && (
                          <div className="py-3 px-2 flex items-center justify-center text-sm">
                            No Customer found.
                          </div>
                        )}

                        {!contactsLoading &&
                          !contactsError &&
                          contacts &&
                          contacts.length > 0 && (
                            <ScrollArea>
                              {contacts?.map((contact) => (
                                <div
                                  key={contact.id}
                                  className={cn(
                                    "w-full flex items-center p-2 cursor-pointer text-sm hover:bg-muted",
                                    field.value === contact.id && "bg-muted"
                                  )}
                                  onClick={() => {
                                    form.setValue("customerId", contact.id);

                                    setOpenPopover(false);
                                  }}
                                >
                                  {field.value === contact.id && (
                                    <CheckIcon className="mr-2 h-4 w-4" />
                                  )}

                                  {contact.name}
                                </div>
                              ))}
                            </ScrollArea>
                          )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />

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
