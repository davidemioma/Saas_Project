import React from "react";
import { EditorBtns } from "@/lib/constants";
import TextPlaceholder from "./TextPlaceholder";
import LinkPlaceholder from "./LinkPlaceholder";
import VideoPlaceholder from "./VideoPlaceholder";
import TwoColPlaceholder from "./TwoColPlaceholder";
import ContactPlaceholder from "./ContactPlaceholder";
import CheckoutPlaceholder from "./CheckoutPlaceholder";
import ThreeColPlaceholder from "./ThreeColPlaceholder";
import ContainerPlaceholder from "./ContainerPlaceholder";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ElementType = {
  id: EditorBtns;
  label: string;
  Component: React.ReactNode;
  group: "layout" | "elements";
};

const ComponentsTab = () => {
  const elements: ElementType[] = [
    {
      id: "text",
      label: "Text",
      Component: <TextPlaceholder />,
      group: "elements",
    },
    {
      id: "link",
      label: "Link",
      Component: <LinkPlaceholder />,
      group: "elements",
    },
    {
      id: "container",
      label: "Container",
      Component: <ContainerPlaceholder />,
      group: "layout",
    },
    {
      id: "2Col",
      label: "2 Column",
      Component: <TwoColPlaceholder />,
      group: "layout",
    },
    {
      id: "3Col",
      label: "3 Column",
      Component: <ThreeColPlaceholder />,
      group: "layout",
    },
    {
      id: "video",
      label: "Video",
      Component: <VideoPlaceholder />,
      group: "elements",
    },
    {
      id: "contactForm",
      label: "Contact Form",
      Component: <ContactPlaceholder />,
      group: "elements",
    },
    {
      id: "paymentForm",
      label: "Checkout",
      Component: <CheckoutPlaceholder />,
      group: "elements",
    },
  ];

  return (
    <Accordion
      className="w-full"
      type="multiple"
      defaultValue={["Layout", "Elements"]}
    >
      <AccordionItem className="border-y px-6 py-0" value="Layout">
        <AccordionTrigger className="no-underline">Layout</AccordionTrigger>

        <AccordionContent className="flex flex-wrap gap-2">
          {elements
            .filter((element) => element.group === "layout")
            .map((element) => (
              <div
                key={element.id}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                {element.Component}

                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem className="px-6 py-0" value="Elements">
        <AccordionTrigger className="no-underline">Elements</AccordionTrigger>

        <AccordionContent className="flex flex-wrap gap-2">
          {elements
            .filter((element) => element.group === "elements")
            .map((element) => (
              <div
                key={element.id}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                {element.Component}

                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ComponentsTab;
