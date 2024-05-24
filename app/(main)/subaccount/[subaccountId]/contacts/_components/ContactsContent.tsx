"use client";

import React, { useState } from "react";
import { ContactProps } from "@/types";
import { columns } from "../_components/Columns";
import { DataTable } from "@/components/ui/data-table";
import CustomModal from "@/components/modals/CustomModal";
import ContactUserForm from "@/components/forms/ContactUserForm";

type Props = {
  subAccountId: string;
  contacts: ContactProps[];
};

const ContactsContent = ({ subAccountId, contacts }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <CustomModal
          open={open}
          onOpenChange={() => setOpen(false)}
          title="Create Or Update Contact information"
          subheading="Contacts are like customers."
        >
          <ContactUserForm
            subAccountId={subAccountId}
            onClose={() => setOpen(false)}
          />
        </CustomModal>
      )}

      <div className="w-full h-full">
        <h1 className="text-4xl p-4">Contacts</h1>

        <DataTable
          filterValue="email"
          data={contacts}
          columns={columns}
          actionButtonText="Create Contact"
          onOpen={() => setOpen(true)}
        />
      </div>
    </>
  );
};

export default ContactsContent;
