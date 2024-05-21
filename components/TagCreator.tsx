"use client";

import React, { useState } from "react";
import Loader from "./Loader";
import { toast } from "sonner";
import { Tag } from "@prisma/client";
import TagColorsSelect from "./TagColorsSelect";
import { PlusCircleIcon, TrashIcon, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrUpdateTag,
  deleteTagById,
  getSubAccountTags,
} from "@/data/queries";
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
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Props = {
  subAccountId: string;
  defaultTags?: Tag[];
};

const TagColors = ["BLUE", "ORANGE", "ROSE", "PURPLE", "GREEN"] as const;

export type TagColor = (typeof TagColors)[number];

const TagCreator = ({ subAccountId, defaultTags }: Props) => {
  const queryClient = useQueryClient();

  const [value, setValue] = useState("");

  const [showDelete, setShoeDelete] = useState(false);

  const [selectedColor, setSelectedColor] = useState("");

  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<Tag[]>(defaultTags || []);

  const {
    data: allTags,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-subaccount-tags", subAccountId],
    queryFn: async () => {
      const tags = await getSubAccountTags(subAccountId);

      return tags;
    },
  });

  const handleAddSelections = (newTag: Tag) => {
    if (selectedTags.every((tag) => tag.id !== newTag.id)) {
      setSelectedTags((prev) => [newTag, ...prev]);
    }
  };

  const handleDeleteSelection = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const { mutate: addTag, isPending: adding } = useMutation({
    mutationKey: ["add-tag"],
    mutationFn: async () => {
      if (!value) {
        toast.info("Tag name should not be empty");

        return;
      }

      if (!selectedColor) {
        toast.info("Select a color");

        return;
      }

      await createOrUpdateTag({
        subAccountId,
        name: value,
        color: selectedColor,
      });
    },
    onSuccess: () => {
      setValue("");

      setSelectedColor("");

      toast.success("Added tag");

      queryClient.invalidateQueries({
        queryKey: ["get-subaccount-tags", subAccountId],
      });
    },
    onError: (err) => {
      toast.error("Something went wrong! could not add tag");
    },
  });

  const { mutate: deleteTag, isPending: deleting } = useMutation({
    mutationKey: ["delete-tag"],
    mutationFn: async () => {
      if (!selectedTagId) {
        toast.info("Select the tag you want to delete");

        return;
      }

      await deleteTagById({ subAccountId, tagId: selectedTagId });
    },
    onSuccess: () => {
      setSelectedTagId(null);

      toast.success("Deleted tag");

      queryClient.invalidateQueries({
        queryKey: ["get-subaccount-tags", subAccountId],
      });
    },
    onError: (err) => {
      toast.error("Something went wrong! could not delete tag");
    },
  });

  const disabled = adding || deleting;

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {showDelete && (
        <AlertDialog
          open={showDelete}
          onOpenChange={() => setShoeDelete(false)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Are you absolutely sure?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-left">
                This action cannot be undone. This will permanently delete your
                the tag and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShoeDelete(false);

                  setSelectedTagId(null);
                }}
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction onClick={() => deleteTag()}>
                Delete Tag
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Command className="bg-transparent">
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-background border-2 border-border rounded-md">
            {selectedTags.map((tag) => (
              <div key={tag.id} className="flex items-center">
                <TagColorsSelect title={tag.name} colorName={tag.color} />

                <button
                  type="button"
                  className="text-muted-foreground cursor-pointer"
                  disabled={disabled}
                  onClick={() => handleDeleteSelection(tag.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 my-2">
          {TagColors.map((colorName) => (
            <TagColorsSelect
              key={colorName}
              title=""
              colorName={colorName}
              setSelectedColor={setSelectedColor}
            />
          ))}
        </div>

        <div className="relative">
          <CommandInput
            placeholder="Search for tag..."
            value={value}
            onValueChange={setValue}
          />

          <button
            type="button"
            className="absolute top-1/2 transform -translate-y-1/2 right-2 hover:text-primary transition-all cursor-pointer text-muted-foreground"
            onClick={() => addTag()}
            disabled={disabled}
          >
            <PlusCircleIcon size={20} />
          </button>
        </div>

        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup>
            {!isError &&
              Array.isArray(allTags) &&
              allTags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  className="hover:!bg-secondary !bg-transparent flex items-center justify-between !font-light cursor-pointer"
                >
                  <div onClick={() => handleAddSelections(tag)}>
                    <TagColorsSelect title={tag.name} colorName={tag.color} />
                  </div>

                  <button
                    type="button"
                    className="cursor-pointer text-muted-foreground hover:text-rose-400  transition-all"
                    disabled={disabled}
                    onClick={() => {
                      setShoeDelete(true);

                      setSelectedTagId(tag.id);
                    }}
                  >
                    <TrashIcon size={16} />
                  </button>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  );
};

export default TagCreator;
