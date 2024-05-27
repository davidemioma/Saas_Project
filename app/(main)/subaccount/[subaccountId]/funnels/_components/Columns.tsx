"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Funnel } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Funnel>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <Link
          className="flex gap-2 items-center"
          href={`/subaccount/${row.original.subAccountId}/funnels/${row.original.id}`}
        >
          {row.original.name}
          <ExternalLink size={15} />
        </Link>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {format(row.original.updatedAt, "MMMM do, yyyy")}
      </span>
    ),
  },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ row }) => (
      <>
        {row.original.published ? (
          <Badge variant={"default"}>Live - {row.original.subDomainName}</Badge>
        ) : (
          <Badge variant={"secondary"}>Draft</Badge>
        )}
      </>
    ),
  },
];
