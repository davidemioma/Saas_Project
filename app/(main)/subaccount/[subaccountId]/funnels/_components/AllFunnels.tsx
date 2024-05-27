"use client";

import React, { useState } from "react";
import { columns } from "./Columns";
import { Plus } from "lucide-react";
import { Funnel } from "@prisma/client";
import FunnelForm from "@/components/forms/FunnelForm";
import { DataTable } from "@/components/ui/data-table";
import CustomModal from "@/components/modals/CustomModal";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  subAccountId: string;
  funnels: Funnel[];
};

const AllFunnels = ({ subAccountId, funnels }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <CustomModal
          open={open}
          onOpenChange={() => setOpen(false)}
          title="Create A Funnel"
          subheading="Funnels are a like websites, but better! Try creating one!"
        >
          <div className="h-[70vh]">
            <ScrollArea>
              <FunnelForm
                subAccountId={subAccountId}
                onClose={() => setOpen(false)}
              />
            </ScrollArea>
          </div>
        </CustomModal>
      )}

      <DataTable
        filterValue="name"
        data={funnels}
        columns={columns}
        actionButtonText={
          <>
            <Plus size={15} className="mr-2" />
            Create Funnel
          </>
        }
        onOpen={() => setOpen(true)}
      />
    </>
  );
};

export default AllFunnels;
