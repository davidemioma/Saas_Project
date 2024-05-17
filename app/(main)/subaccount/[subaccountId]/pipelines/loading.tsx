import React from "react";
import Loader from "@/components/Loader";

const loading = () => {
  return (
    <div className="w-full h-screen -mt-8 flex items-center justify-center">
      <Loader />
    </div>
  );
};

export default loading;
