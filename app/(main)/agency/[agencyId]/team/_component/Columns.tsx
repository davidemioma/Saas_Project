"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import CellActions from "./CellActions";
import { TeamMemberProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<TeamMemberProps>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="relative h-11 w-11">
          <Image
            className="rounded-full object-cover flex flex-shrink-0"
            src={row.original.avatarUrl}
            fill
            alt="avatar image"
          />
        </div>

        <span>{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "subAccounts",
    header: "Owned Accounts",
    cell: ({ row }) => {
      const isAgencyOwner = row.original.role === "AGENCY_OWNER";

      const ownedAccounts = row.original?.permissions?.filter(
        (permission) => permission.access
      );

      if (isAgencyOwner) {
        return (
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              <Badge className="bg-slate-600 whitespace-nowrap">
                Agency - {row?.original?.agency?.name}
              </Badge>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-start">
          {ownedAccounts.length > 0 ? (
            <div className="flex flex-col gap-2">
              {ownedAccounts.map((account) => (
                <Badge
                  key={account.id}
                  className="bg-slate-600 w-fit whitespace-nowrap"
                >
                  Sub Account - {account.subAccount.name}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No Access Yet</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;

      return (
        <Badge
          className={cn({
            "bg-emerald-500": role === "AGENCY_OWNER",
            "bg-orange-400": role === "AGENCY_ADMIN",
            "bg-primary": role === "SUBACCOUNT_USER",
            "bg-muted": role === "SUBACCOUNT_GUEST",
          })}
        >
          {role}
        </Badge>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];
