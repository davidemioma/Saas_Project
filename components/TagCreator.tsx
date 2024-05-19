"use client";

import React from "react";
import { Tag } from "@prisma/client";
import { useRouter } from "next/navigation";
import { PlusCircleIcon, TrashIcon, X } from "lucide-react";
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
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type Props = {
  subAccountId: string;
  defaultTags?: Tag[];
};

const TagColors = ["BLUE", "ORANGE", "ROSE", "PURPLE", "GREEN"] as const;

export type TagColor = (typeof TagColors)[number];

const TagCreator = ({ subAccountId, defaultTags }: Props) => {
  const router = useRouter();

  return <div>TagCreator</div>;
};

export default TagCreator;
