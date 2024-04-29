import React from "react";
import Loader from "./Loader";

const LoadingPage = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader />
    </div>
  );
};

export default LoadingPage;
