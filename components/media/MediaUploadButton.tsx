"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import CustomModal from "../modals/CustomModal";
import UploadMediaForm from "../forms/UploadMediaForm";

type Props = {
  subAccountId: string;
};

const MediaUploadButton = ({ subAccountId }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CustomModal
        open={open}
        onOpenChange={() => setOpen(false)}
        title="Upload Media"
        subheading="Upload a file to your media bucket"
      >
        <div className="h-[70vh]">
          <ScrollArea>
            <UploadMediaForm
              subAccountId={subAccountId}
              onClose={() => setOpen(false)}
            />
          </ScrollArea>
        </div>
      </CustomModal>

      <Button onClick={() => setOpen(true)}>Upload</Button>
    </>
  );
};

export default MediaUploadButton;
