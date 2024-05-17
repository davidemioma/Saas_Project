"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AuthUser } from "@/types";
import { Button } from "../ui/button";
import { icons } from "@/lib/constants";
import { Separator } from "../ui/separator";
import CustomModal from "../modals/CustomModal";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import SubAccountDetails from "../forms/SubAccountDetails";
import { Menu, Compass, ChevronsUpDown, PlusCircleIcon } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  const [open, setOpen] = useState(false);

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
    <>
      <CustomModal
        open={open}
        onOpenChange={() => setOpen(false)}
        title="Create A Subaccount"
        subheading="You can switch between your agency account and the subaccount from the sidebar"
      >
        <div className="h-[70vh]">
          <SubAccountDetails
            agencyDetails={user?.agency || null}
            userName={user?.name || ""}
            onClose={() => setOpen(false)}
          />
        </div>
      </CustomModal>

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
          <AspectRatio ratio={16 / 4}>
            <Image
              className="rounded-md object-cover"
              src={sidebarLogo}
              fill
              alt="Sidebar Logo"
            />
          </AspectRatio>

          <Popover>
            <PopoverTrigger className="w-full outline-none ring-0">
              <Button
                className="w-full flex items-center justify-between gap-5 py-8 my-4"
                variant="ghost"
              >
                <div className="flex items-center gap-2 text-left">
                  <Compass />

                  <div className="flex flex-col w-40 truncate">
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
              <Command className="rounded-lg">
                <CommandInput placeholder="Search Accounts..." />

                <CommandList className="pb-16">
                  <CommandEmpty>No results found.</CommandEmpty>

                  {user?.agency &&
                    (user.role === "AGENCY_ADMIN" ||
                      user.role === "AGENCY_OWNER") && (
                      <CommandGroup heading="Agency">
                        <CommandItem className="!bg-transparent my-2 text-primary border border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.agency?.id}`}
                              className="w-full h-full flex gap-4 "
                            >
                              <div className="relative w-16">
                                <Image
                                  className="rounded-md object-contain"
                                  src={user?.agency?.agencyLogo}
                                  fill
                                  alt="Agency Logo"
                                />
                              </div>

                              <div className="flex flex-col flex-1">
                                {user?.agency?.name}

                                <span className="text-muted-foreground">
                                  {user?.agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.agency?.id}`}
                                className="w-full h-full flex gap-4"
                              >
                                <div className="relative w-16">
                                  <Image
                                    className="rounded-md object-contain"
                                    src={user?.agency?.agencyLogo}
                                    fill
                                    alt="Agency Logo"
                                  />
                                </div>

                                <div className="flex flex-col flex-1">
                                  {user?.agency?.name}

                                  <span className="text-muted-foreground">
                                    {user?.agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}

                  {subAccounts.length > 0 && (
                    <CommandGroup heading="Accounts">
                      {subAccounts.map((subAccount) => (
                        <CommandItem key={subAccount.id}>
                          {defaultOpen ? (
                            <Link
                              href={`/subaccount/${subAccount.id}`}
                              className="w-full h-full flex gap-4"
                            >
                              <div className="relative w-16">
                                <Image
                                  className="rounded-md object-contain"
                                  src={subAccount.subAccountLogo}
                                  fill
                                  alt="subaccount Logo"
                                />
                              </div>

                              <div className="flex flex-col flex-1">
                                {subAccount.name}

                                <span className="text-muted-foreground">
                                  {subAccount.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/subaccount/${subAccount.id}`}
                                className="w-full h-full flex gap-4"
                              >
                                <div className="relative w-16">
                                  <Image
                                    className="rounded-md object-contain"
                                    src={subAccount.subAccountLogo}
                                    fill
                                    alt="subaccount Logo"
                                  />
                                </div>

                                <div className="flex flex-col flex-1">
                                  {subAccount.name}

                                  <span className="text-muted-foreground">
                                    {subAccount.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>

                {(user?.role === "AGENCY_ADMIN" ||
                  user?.role === "AGENCY_OWNER") && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2"
                      onClick={() => setOpen(true)}
                    >
                      <PlusCircleIcon size={15} />
                      Create Sub Account
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>

          <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>

          <Separator className="mb-5" />

          <div className="space-y-1">
            {sidebarOpt.map((sidebarOptions) => {
              let Icon;

              const result = icons.find(
                (icon) => icon.value === sidebarOptions.icon
              );

              if (result) {
                Icon = <result.path />;
              }

              return (
                <div
                  key={sidebarOptions.id}
                  className="w-full py-1 px-2 bg-transparent text-muted-foreground hover:bg-primary hover:text-white hover:font-bold rounded-lg"
                >
                  <Link
                    href={sidebarOptions.link}
                    className="w-full flex items-center gap-2 rounded-md transition-all"
                  >
                    {Icon}

                    <span className="text-sm">{sidebarOptions.name}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SidebarOptions;
