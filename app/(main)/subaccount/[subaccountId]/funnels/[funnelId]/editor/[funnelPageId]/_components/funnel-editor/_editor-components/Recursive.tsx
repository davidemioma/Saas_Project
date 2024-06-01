import React from "react";
import Text from "./Text";
import Container from "./Container";
import { EditorElement } from "@/providers/editor/editor-reducer";

type Props = {
  element: EditorElement;
};

const Recursive = ({ element }: Props) => {
  switch (element.type) {
    case "text":
      return <Text element={element} />;
    case "container":
      return <Container element={element} />;
    case "video":
      return <div>video componemt</div>;
    case "contactForm":
      return <div>contactForm componemt</div>;
    case "paymentForm":
      return <div>paymentForm componemt</div>;
    case "2Col":
      return <div>2Col componemt</div>;
    case "__body":
      return <Container element={element} />;
    case "link":
      return <div>link componemt</div>;
    default:
      return null;
  }
};

export default Recursive;
