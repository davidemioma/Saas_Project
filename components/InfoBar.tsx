"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { ModeToggle } from "./ModeTggle";
import { UserButton } from "@clerk/nextjs";
import { NotificationProps } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Props = {
  className?: string;
  notifications: NotificationProps[];
};

const InfoBar = ({ className, notifications }: Props) => {
  return (
    <div
      className={cn(
        "bg-background/80 fixed top-0 inset-x-0 md:left-[300px] z-[20] flex items-center p-4 border-b backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center gap-2 ml-auto">
        <UserButton afterSignOutUrl="/" />

        <Sheet>
          <SheetTrigger>
            <div className="bg-primary flex items-center justify-center w-9 h-9 text-white rounded-full">
              <Bell size={17} />
            </div>
          </SheetTrigger>

          <SheetContent showX>
            <SheetHeader className="text-left">
              <SheetTitle>Notifications</SheetTitle>

              <SheetDescription>View all notifications</SheetDescription>
            </SheetHeader>

            <ScrollArea className="pt-5">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="text-ellipsis overflow-x-scroll"
                    >
                      <div className="flex gap-2">
                        <Avatar>
                          <AvatarImage
                            src={notification.user.avatarUrl}
                            alt="Profile Picture"
                          />

                          <AvatarFallback className="bg-primary">
                            {notification.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                          <p>
                            <span className="font-bold">
                              {notification.notification.split("|")[0]}
                            </span>
                            <span className="text-muted-foreground">
                              {notification.notification.split("|")[1]}
                            </span>
                            <span className="font-bold">
                              {notification.notification.split("|")[2]}
                            </span>
                          </p>

                          <small className="text-xs text-muted-foreground">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center mt-5 text-muted-foreground">
                  You have no notifications
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <ModeToggle />
      </div>
    </div>
  );
};

export default InfoBar;
