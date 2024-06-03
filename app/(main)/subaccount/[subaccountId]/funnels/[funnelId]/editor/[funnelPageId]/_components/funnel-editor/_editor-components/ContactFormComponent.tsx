"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import { getFunnel } from "@/data/queries";
import { useRouter } from "next/navigation";
import { EditorBtns } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import ContactForm from "@/components/forms/ContactForm";
import { useEditor } from "@/providers/editor/editor-provider";
import { EditorElement } from "@/providers/editor/editor-reducer";

type Props = {
  element: EditorElement;
};

const ContactFormComponent = ({ element }: Props) => {
  const router = useRouter();

  const { state, dispatch, subaccountId, funnelId, pageDetails } = useEditor();

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

  const goToNextPage = async () => {
    if (!state.editor.liveMode) return;

    const funnel = await getFunnel({ subAccountId: subaccountId, funnelId });

    if (!funnel || !pageDetails) return;

    if (funnel.funnelPages.length > pageDetails.order + 1) {
      const nextPage = funnel.funnelPages.find(
        (page) => page.order === pageDetails.order + 1,
      );

      if (!nextPage) return;

      router.push(
        `${process.env.NEXT_PUBLIC_SCHEME}${funnel.subDomainName}.${process.env.NEXT_PUBLIC_DOMAIN}/${nextPage.pathName}`,
      );
    }
  };

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
      onDragStart={(e) => onDragStart(e, "contactForm")}
      onClick={onBodyClicked}
    >
      {state.editor.selectedElement.id === element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -left-[1px] -top-[23px] rounded-none rounded-t-lg">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      <ContactForm
        subTitle="Contact Us"
        title="Want a free quote? We can help you"
        subAccountId={subaccountId}
        goToNextPage={goToNextPage}
      />

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

export default ContactFormComponent;
