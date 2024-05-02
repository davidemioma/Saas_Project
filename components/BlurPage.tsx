import React from "react";

type Props = {
  children: React.ReactNode;
};

const BlurPage = ({ children }: Props) => {
  return (
    <div
      id="blur-page"
      className="bg-muted/60 dark:bg-muted/40 absolute inset-0 z-[11] pt-24 p-4 h-screen w-full mx-auto overflow-scroll backdrop-blur-[35px] dark:shadow-2xl dark:shadow-black"
    >
      {children}
    </div>
  );
};

export default BlurPage;
