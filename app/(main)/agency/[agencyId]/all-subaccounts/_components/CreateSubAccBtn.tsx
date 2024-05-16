"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AuthUser } from "@/types";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/modals/CustomModal";
import SubAccountDetails from "@/components/forms/SubAccountDetails";

type Props = {
  agencyId: string;
  authUser: AuthUser | null;
  className?: string;
};

const CreateSubAccBtn = ({ agencyId, authUser, className }: Props) => {
  const [open, setOpen] = useState(false);

  const agencyDetails = authUser?.agency;

  if (!agencyDetails) return null;

  return (
    <>
      <CustomModal
        open={open}
        onOpenChange={() => setOpen(false)}
        title="Create a Subaccount"
        subheading="You can switch bettween"
      >
        <div className="h-[70vh]">
          <SubAccountDetails
            userName={authUser.name}
            agencyDetails={agencyDetails}
            onClose={() => setOpen(false)}
          />
        </div>
      </CustomModal>

      <Button
        className={cn("w-full flex gap-4", className)}
        onClick={() => setOpen(true)}
      >
        <PlusCircleIcon size={15} />
        Create Sub Account
      </Button>
    </>
  );
};

export default CreateSubAccBtn;
