"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  defaultOpen?: boolean;
  onOpenChange: () => void;
  title: string;
  subheading: string;
  children: React.ReactNode;
};

const CustomModal = ({
  open,
  defaultOpen,
  onOpenChange,
  title,
  subheading,
  children,
}: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Dialog open={open || defaultOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>{subheading}</DialogDescription>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
