"use client";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { customFileRouter } from "../router";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const UploadDropzoneComponent = generateUploadDropzone<customFileRouter>();

export function UploadDropZone({
  className,
  onClientUploadComplete,
  onUploadError,
  ...props
}: ComponentProps<typeof UploadDropzoneComponent>) {
  return (
    <UploadDropzoneComponent
      {...props}
      className={cn(
        "border-dashed border-2 border-muted rounded-lg flex items-center justify-center",
        className,
      )}
      onClientUploadComplete={(res) => {
        res.forEach(({ serverData }) => {
          if (serverData && "message" in serverData) {
            toast.success(serverData.message as string);
          }
        });
        onClientUploadComplete?.(res);
      }}
      onUploadError={(error) => {
        toast.error(error.message);
        onUploadError?.(error);
      }}
    />
  );
}
