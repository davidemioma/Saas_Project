import React from "react";
import Image from "next/image";
import { EditorBtns } from "@/lib/constants";

const CheckoutPlaceholder = () => {
  const onDragState = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;

    e.dataTransfer.setData("componentType", type);
  };

  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted"
      draggable
      onDragStart={(e) => {
        onDragState(e, "paymentForm");
      }}
    >
      <Image
        className="object-cover"
        src="/assets/stripelogo.png"
        height={40}
        width={40}
        alt="stripe logo"
      />
    </div>
  );
};

export default CheckoutPlaceholder;
