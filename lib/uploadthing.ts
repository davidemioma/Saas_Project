import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  generateUploader,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

export const Uploader = generateUploader<OurFileRouter>();

export const UploadButton = generateUploadButton<OurFileRouter>();

export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
