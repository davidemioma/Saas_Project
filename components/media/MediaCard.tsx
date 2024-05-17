"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Media } from "@prisma/client";
import DeleteMedia from "./DeleteMedia";
import { useRouter } from "next/navigation";
import { Copy, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteMedia } from "@/data/queries";

type Props = {
  item: Media;
};

const MediaCard = ({ item }: Props) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const onDeleteMedia = async () => {
    setLoading(true);

    try {
      await deleteMedia(item.id);

      toast.success("Media deleted");

      setOpen(false);

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! could not delete media.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DeleteMedia
        open={open}
        onOpenChange={() => setOpen(false)}
        onConfirm={onDeleteMedia}
      />

      <DropdownMenu>
        <article className="w-full bg-slate-900 border rounded-lg">
          <div className="relative w-full h-40 rounded-lg overflow-hidden">
            <Image
              className="object-cover"
              src={item.link}
              fill
              alt="preview image"
            />
          </div>

          <p className="opacity-0 h-0 w-0">{item.name}</p>

          <div className="p-4 relative">
            <p className="text-muted-foreground">
              {item.createdAt.toDateString()}
            </p>

            <p>{item.name}</p>

            <div className="absolute top-4 right-4 p-[1px] cursor-pointer ">
              <DropdownMenuTrigger disabled={loading}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
            </div>
          </div>

          <DropdownMenuContent>
            <DropdownMenuLabel>Menu</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="flex gap-2"
              disabled={loading}
              onClick={() => {
                navigator.clipboard.writeText(item.link);

                toast.info("Copied To Clipboard");
              }}
            >
              <Copy size={15} /> Copy Image Link
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex gap-2"
              disabled={loading}
              onClick={() => setOpen(true)}
            >
              <Trash size={15} /> Delete File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </article>
      </DropdownMenu>
    </>
  );
};

export default MediaCard;
