"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import Loader from "@/components/Loader";
import axios, { AxiosError } from "axios";
import { EditorBtns } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { getStripe } from "@/lib/stripe/stripe-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEditor } from "@/providers/editor/editor-provider";
import { EditorElement } from "@/providers/editor/editor-reducer";
import { getFunnel, getSubaccountConnectedId } from "@/data/queries";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

type Props = {
  element: EditorElement;
};

const CheckoutComponent = ({ element }: Props) => {
  const [clientSecret, setClientSecret] = useState("");

  const { state, dispatch, subaccountId, funnelId } = useEditor();

  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

  const onBodyClicked = (e: React.MouseEvent) => {
    e.stopPropagation();

    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  const onDeleteElement = (e: React.MouseEvent) => {
    e.stopPropagation();

    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  const onDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;

    e.dataTransfer.setData("componentType", type);
  };

  const { data: subAccountConnectAccId } = useQuery({
    queryKey: ["subaccount-connected-account-id", subaccountId],
    queryFn: async () => {
      const subaccount = await getSubaccountConnectedId({
        subAccountId: subaccountId,
      });

      return subaccount?.connectAccountId;
    },
  });

  const { data: livePrices } = useQuery({
    queryKey: ["funnel-live-prices", subaccountId, funnelId],
    queryFn: async () => {
      const funnel = await getFunnel({
        subAccountId: subaccountId,
        funnelId,
      });

      return JSON.parse(funnel?.liveProducts || "[]");
    },
  });

  const { mutate: getClientSecret, isPending } = useMutation({
    mutationKey: [
      "get-client-secret",
      subaccountId,
      subAccountConnectAccId,
      livePrices,
    ],
    mutationFn: async () => {
      if (!livePrices.length || !subaccountId || !subAccountConnectAccId) {
        return;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/stripe/create-checkout-session`,
        {
          subaccountId,
          subAccountConnectAccId,
          prices: livePrices,
        },
      );

      return res.data.clientSecret;
    },
    onSuccess: (data) => {
      setClientSecret(data);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      }
    },
  });

  useEffect(() => {
    getClientSecret();
  }, [subaccountId, subAccountConnectAccId, livePrices]);

  return (
    <div
      style={element.styles}
      className={cn(
        "relative m-1 w-full p-0.5 text-[16px] transition-all",
        state.editor.selectedElement.id === element.id &&
          "!border-solid !border-blue-500",
        !state.editor.liveMode && "border border-dashed border-violet-500",
      )}
      draggable
      onDragStart={(e) => onDragStart(e, "paymentForm")}
      onClick={onBodyClicked}
    >
      {state.editor.selectedElement.id === element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -left-[1px] -top-[23px] rounded-none rounded-t-lg">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      <div className="w-full border-none transition-all">
        <div className="flex w-full flex-col gap-4">
          {options.clientSecret && subAccountConnectAccId && (
            <div className="text-white">
              <EmbeddedCheckoutProvider
                stripe={getStripe(subAccountConnectAccId)}
                options={options}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}

          {isPending && !options.clientSecret && (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader />
            </div>
          )}
        </div>
      </div>

      {state.editor.selectedElement.id === element.id &&
        !state.editor.liveMode && (
          <div className="absolute -right-[1px] -top-[25px] rounded-none rounded-t-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={onDeleteElement}
            />
          </div>
        )}
    </div>
  );
};

export default CheckoutComponent;
