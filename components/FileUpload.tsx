"use client";

import React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { FileIcon, X } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

type Props = {
  apiEndpoint: "agencyLogo" | "avatar" | "subaccountLogo";
  onChange: (url?: string) => void;
  value?: string;
};

const FileUpload = ({ apiEndpoint, onChange, value }: Props) => {
  const fileType = value?.split(".").pop();

  if (value)
    return (
      <div className="flex flex-col justify-center items-center">
        {fileType !== "pdf" ? (
          <div className="relative w-40 h-40">
            <Image
              className="object-cover"
              src={value}
              fill
              alt="uploaded image"
            />
          </div>
        ) : (
          <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
            <FileIcon />

            <a
              className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              href={value}
              target="_blank"
              rel="noopener_noreferrer"
            >
              View PDF
            </a>
          </div>
        )}

        <Button onClick={() => onChange("")} variant="ghost" type="button">
          <X className="h-4 w-4 mr-2" />
          Remove Logo
        </Button>
      </div>
    );

  return (
    <div className="w-full bg-muted/30">
      <UploadDropzone
        endpoint={apiEndpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url);
        }}
        onUploadError={(error: Error) => {
          toast.error("Something went wrong! could not upload file.");

          console.log(error);
        }}
      />
    </div>
  );
};

export default FileUpload;
