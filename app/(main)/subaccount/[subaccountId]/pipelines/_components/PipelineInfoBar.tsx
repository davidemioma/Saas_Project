"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pipeline } from "@prisma/client";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/modals/CustomModal";
import { ChevronsUpDown, Check, Plus } from "lucide-react";
import CreatePipeline from "@/components/forms/CreatePipeline";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Props = {
  pipelineId: string;
  subAccountId: string;
  pipelines: Pipeline[];
};

const PipelineInfoBar = ({ pipelineId, subAccountId, pipelines }: Props) => {
  const [open, setOpen] = useState(false);

  const [openNew, setOpenNew] = useState(false);

  const [value, setValue] = useState(pipelineId);

  return (
    <>
      <CustomModal
        open={openNew}
        onOpenChange={() => setOpenNew(false)}
        title="Create A Pipeline"
        subheading="Pipelines allows you to group tickets into lanes and track your business processes all in one place."
      >
        <CreatePipeline
          subAccountId={subAccountId}
          onClose={() => setOpenNew(false)}
        />
      </CustomModal>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="w-[200px] justify-between"
            variant="outline"
            role="combobox"
            aria-expanded={open}
          >
            <span className="flex-1 text-left truncate">
              {value
                ? pipelines.find((pipeline) => pipeline.id === value)?.name
                : "Select a pipeline..."}
            </span>

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[250px] p-2">
          <Command>
            <CommandList>
              <CommandEmpty>No pipelines found.</CommandEmpty>

              <CommandGroup>
                {pipelines.map((pipeline) => (
                  <Link
                    key={pipeline.id}
                    href={`/subaccount/${subAccountId}/pipelines/${pipeline.id}`}
                  >
                    <CommandItem
                      key={pipeline.id}
                      value={pipeline.id}
                      onSelect={(currentValue) => {
                        setValue(currentValue);

                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === pipeline.id ? "opacity-100" : "opacity-0"
                        )}
                      />

                      {pipeline.name}
                    </CommandItem>
                  </Link>
                ))}
              </CommandGroup>

              <Button
                className="w-full flex gap-2 mt-4"
                variant="secondary"
                onClick={() => setOpenNew(true)}
              >
                <Plus size={15} />
                Create Pipeline
              </Button>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default PipelineInfoBar;
