"use client";

import { format } from "date-fns";
import { ContactProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatTotal = (ticket: { value: number | null }[]) => {
  if (!ticket || !ticket.length) return "$0.00";

  const amt = new Intl.NumberFormat("en-us", {
    style: "currency",
    currency: "USD",
  });

  const laneAmt = ticket.reduce((sum, ticket) => sum + (ticket.value || 0), 0);

  return amt.format(laneAmt);
};

export const columns: ColumnDef<ContactProps>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage alt="@shadcn" />

        <AvatarFallback className="bg-primary text-white">
          {row.original.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => (
      <>
        {formatTotal(row.original.tickets) === "$0.00" ? (
          <Badge variant={"destructive"}>Inactive</Badge>
        ) : (
          <Badge className="bg-emerald-700">Active</Badge>
        )}
      </>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => <>{format(row.original.createdAt, "MM/dd/yyyy")}</>,
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => <>{formatTotal(row.original.tickets)}</>,
  },
];
