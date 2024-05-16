"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteSubAccount } from "@/data/queries";

type Props = {
  subAccountId: string;
};

const DeleteSubAccBtn = ({ subAccountId }: Props) => {
  const router = useRouter();

  const onClickHandler = async () => {
    try {
      await deleteSubAccount(subAccountId);

      toast.success("Sub account deleted.");

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong! Could not delete sub account.");
    }
  };

  return (
    <div className="text-white" onClick={onClickHandler}>
      Delete Sub Account
    </div>
  );
};

export default DeleteSubAccBtn;
