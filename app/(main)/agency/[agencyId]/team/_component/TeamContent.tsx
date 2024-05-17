"use client";

import React, { useState } from "react";
import { columns } from "./Columns";
import { Plus } from "lucide-react";
import { Role } from "@prisma/client";
import { TeamMemberProps } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import CustomModal from "@/components/modals/CustomModal";
import SendInvitation from "@/components/forms/SendInvitation";

type Props = {
  agencyId: string;
  data: TeamMemberProps[];
};

const TeamContent = ({ agencyId, data }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CustomModal
        title="Invite User"
        subheading="An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation."
        open={open}
        onOpenChange={() => setOpen(false)}
      >
        <SendInvitation agencyId={agencyId} />
      </CustomModal>

      <DataTable
        data={data}
        filterValue="name"
        columns={columns}
        actionButtonText={
          <>
            <Plus size={15} className="mr-2" />
            Add
          </>
        }
        onOpen={() => setOpen(true)}
      />
    </>
  );
};

export default TeamContent;
