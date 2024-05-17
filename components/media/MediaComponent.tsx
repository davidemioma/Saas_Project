import React from "react";
import MediaCard from "./MediaCard";
import { Media } from "@prisma/client";
import { FolderSearch } from "lucide-react";
import MediaUploadButton from "./MediaUploadButton";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Props = {
  subAccountId: string;
  media: Media[];
};

const MediaComponent = ({ subAccountId, media }: Props) => {
  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl">Media Bucket</h1>

        <MediaUploadButton subAccountId={subAccountId} />
      </div>

      <Command className="bg-transparent">
        <CommandInput placeholder="Search for file name..." />

        <CommandList className="pb-40 max-h-full ">
          <CommandEmpty>No Media Files</CommandEmpty>

          <CommandGroup heading="Media Files">
            {media.length > 0 ? (
              <div className="flex flex-wrap gap-4 pt-4">
                {media.map((item) => (
                  <CommandItem
                    key={item.id}
                    className="p-0 max-w-[300px] w-full rounded-lg !bg-transparent !font-medium !text-white"
                  >
                    <MediaCard item={item} />
                  </CommandItem>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center w-full flex-col">
                <FolderSearch
                  size={200}
                  className="dark:text-muted text-slate-300"
                />

                <p className="text-muted-foreground ">
                  Empty! no files to show.
                </p>
              </div>
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default MediaComponent;
