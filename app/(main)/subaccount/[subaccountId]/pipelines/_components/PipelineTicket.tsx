"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { TicketProps } from "@/types";
import { useRouter } from "next/navigation";
import { Draggable } from "@hello-pangea/dnd";
import { deleteTicketById } from "@/data/queries";
import { useMutation } from "@tanstack/react-query";
import TicketForm from "@/components/forms/TicketForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomModal from "@/components/modals/CustomModal";
import TagColorsSelect from "@/components/TagColorsSelect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Contact2,
  Edit,
  LinkIcon,
  MoreHorizontalIcon,
  Trash,
  User2,
} from "lucide-react";
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
  index: number;
  ticket: TicketProps;
  subaccountId: string;
  laneId: string;
};

const PipelineTicket = ({ index, ticket, subaccountId, laneId }: Props) => {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate: deleteTicket, isPending } = useMutation({
    mutationKey: ["delete-ticket"],
    mutationFn: async () => {
      await deleteTicketById({
        subAccountId: subaccountId,
        ticketId: ticket.id,
        laneId,
      });
    },
    onSuccess: () => {
      toast.success(`Ticket deleted.`);

      setIsDeleting(false);

      router.refresh();
    },
    onError: (err) => {
      toast.error(`Something went wrong! could not delete ticket.`);
    },
  });

  return (
    <>
      {isEditing && (
        <CustomModal
          open={isEditing}
          onOpenChange={() => setIsEditing(false)}
          title="Update Ticket Details"
          subheading=""
        >
          <div className="h-[70vh]">
            <ScrollArea>
              <TicketForm
                laneId={laneId}
                subaccountId={subaccountId}
                onClose={() => setIsEditing(false)}
                defaultTicket={ticket}
              />
            </ScrollArea>
          </div>
        </CustomModal>
      )}

      {isDeleting && (
        <AlertDialog
          open={isDeleting}
          onOpenChange={() => !isPending && setIsDeleting(false)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                ticket from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setIsDeleting(true)}
                disabled={isPending}
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={() => deleteTicket()}
                disabled={isPending}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Draggable draggableId={ticket.id} index={index}>
        {(provided) => {
          return (
            <div
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              className="w-full"
            >
              <DropdownMenu>
                <Card className="bg-white dark:bg-slate-900  shadow-none transition-all">
                  <CardHeader className="p-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg w-full">{ticket.name}</span>

                      <DropdownMenuTrigger>
                        <MoreHorizontalIcon className="text-muted-foreground" />
                      </DropdownMenuTrigger>
                    </CardTitle>

                    <span className="text-muted-foreground text-xs">
                      {format(new Date(), "MM/dd/yyyy")}
                    </span>

                    {ticket.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2">
                        {ticket.tags.map((tag) => (
                          <TagColorsSelect
                            key={tag.id}
                            title={tag.name}
                            colorName={tag.color}
                          />
                        ))}
                      </div>
                    )}

                    <CardDescription className="w-full ">
                      {ticket.description}
                    </CardDescription>

                    {ticket.Customer && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-muted-foreground hover:bg-muted transition-all">
                            <LinkIcon />

                            <span className="text-xs font-bold">CONTACT</span>
                          </div>
                        </HoverCardTrigger>

                        <HoverCardContent side="right" className="w-fit">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarImage />

                              <AvatarFallback className="bg-primary">
                                {ticket.Customer?.name
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">
                                {ticket.Customer?.name}
                              </h4>

                              <p className="text-sm text-muted-foreground">
                                {ticket.Customer?.email}
                              </p>

                              <div className="flex items-center pt-2">
                                <Contact2 className="mr-2 h-4 w-4 opacity-70" />

                                <span className="text-xs text-muted-foreground">
                                  Joined{" "}
                                  {format(
                                    ticket?.Customer?.createdAt,
                                    "MM/dd/yyyy"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </CardHeader>

                  {ticket.assignedUser && (
                    <CardFooter className="flex items-center justify-between m-0 p-2 border-t-[1px] border-muted-foreground/20">
                      <div className="flex item-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            alt="contact"
                            src={ticket.assignedUser?.avatarUrl}
                          />

                          <AvatarFallback className="bg-primary text-sm text-white">
                            {ticket.assignedUser?.name}

                            {!ticket.assignedUserId && <User2 size={14} />}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col justify-center">
                          <span className="text-sm text-muted-foreground">
                            {ticket.assignedUserId
                              ? "Assigned to"
                              : "Not Assigned"}
                          </span>

                          {ticket.assignedUserId && (
                            <span className="text-xs w-28  overflow-ellipsis overflow-hidden whitespace-nowrap text-muted-foreground">
                              {ticket.assignedUser?.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-sm font-bold">
                        {!!ticket.value &&
                          new Intl.NumberFormat("en-us", {
                            style: "currency",
                            currency: "USD",
                          }).format(+ticket.value)}
                      </span>
                    </CardFooter>
                  )}

                  <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => setIsDeleting(true)}
                    >
                      <Trash size={15} />
                      Delete Ticket
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={15} />
                      Edit Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </Card>
              </DropdownMenu>
            </div>
          );
        }}
      </Draggable>
    </>
  );
};

export default PipelineTicket;
