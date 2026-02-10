"use client";
import { useRouter } from "next/navigation";
import { UploadDropZone } from "@/services/uploadThing/components/uploadThing";
import { useEffect, useState } from "react";

export function DropzoneClient() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
    );

  return (
    <UploadDropZone
      endpoint="resumeUploader"
      onClientUploadComplete={() => router.refresh()}
    />
  );
}
