import React from "react";
import Text from "./Text";
import Video from "./Video";
import Container from "./Container";
import LinkComponent from "./LinkComponent";
import ImageComponent from "./ImageComponent";
import ContactFormComponent from "./ContactFormComponent";
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
    case "image":
      return <ImageComponent element={element} />;
    case "section":
      return <Container element={element} />;
    case "video":
      return <Video element={element} />;
    case "contactForm":
      return <ContactFormComponent element={element} />;
    case "paymentForm":
      return <div>paymentForm componemt</div>;
    case "2Col":
      return <Container element={element} />;
    case "3Col":
      return <Container element={element} />;
    case "__body":
      return <Container element={element} />;
    case "link":
      return <LinkComponent element={element} />;
    default:
      return null;
  }
};

export default Recursive;
