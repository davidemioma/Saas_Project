"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AuthUser } from "@/types";
import { Button } from "../ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Menu, Compass, ChevronsUpDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  SubAccount,
  AgencySidebarOption,
  SubAccountSidebarOption,
} from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  id: string;
  user: AuthUser | null;
  details: any;
  sidebarLogo: string;
  defaultOpen?: boolean;
  subAccounts: SubAccount[];
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
};

const SidebarOptions = ({
  id,
  user,
  details,
  sidebarLogo,
  defaultOpen,
  subAccounts,
  sidebarOpt,
}: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Sheet {...openState} modal={false}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] flex md:hidden"
      >
        <Button variant="outline" size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        className={cn(
          "fixed top-0 bg-background/80 backdrop-blur-xl py-10 px-6 md:p-6 border-r",
          defaultOpen
            ? "hidden md:inline-block w-[300px] z-0"
            : "inline-block md:hidden w-full z-[100]"
        )}
        showX={!defaultOpen}
        side="left"
      >
        <div>
          <AspectRatio ratio={16 / 4}>
            <Image
              className="rounded-md object-cover"
              src={sidebarLogo}
              fill
              alt="Sidebar Logo"
            />
          </AspectRatio>

          <Popover>
            <PopoverTrigger>
              <Button
                className="w-full flex items-center justify-between gap-5 py-8 my-4"
                variant="ghost"
              >
                <div className="flex items-center gap-2 text-left">
                  <Compass />

                  <div className="flex flex-col">
                    {details.name}

                    <span className="w-40 text-muted-foreground truncate">
                      {details.address}
                    </span>
                  </div>
                </div>

                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              Place content for the popover here.
            </PopoverContent>
          </Popover>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarOptions;
