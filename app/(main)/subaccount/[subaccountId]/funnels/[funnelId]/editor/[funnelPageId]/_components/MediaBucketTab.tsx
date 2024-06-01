"use client";

import React from "react";
import Loader from "@/components/Loader";
import { getMedia } from "@/data/queries";
import { useQuery } from "@tanstack/react-query";
import MediaComponent from "@/components/media/MediaComponent";

type Props = {
  subaccountId: string;
};

const MediaBucketTab = ({ subaccountId }: Props) => {
  const {
    data: allMedia,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-media", subaccountId],
    queryFn: async () => {
      const allMedia = await getMedia({ subAccountId: subaccountId });

      return allMedia;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <span className="text-center text-lg font-medium">
          Could not get media! Please try again later.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <MediaComponent subAccountId={subaccountId} media={allMedia || []} />
    </div>
  );
};

export default MediaBucketTab;
