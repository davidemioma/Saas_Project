"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { StripeChargeProps } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<StripeChargeProps>[] = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <>{row.original.description || "N/A"}</>,
  },
  {
    accessorKey: "id",
    header: "Invoice Id",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.date), "MMMM do, yyyy")}</div>
    ),
  },
  {
    accessorKey: "Paid",
    header: "Paid",
    cell: ({ row }) => (
      <p
        className={cn("", {
          "text-emerald-500": row.original.status.toLowerCase() === "paid",
          "text-orange-600": row.original.status.toLowerCase() === "pending",
          "text-red-600": row.original.status.toLowerCase() === "failed",
        })}
      >
        {row.original.status.toUpperCase()}
      </p>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];
