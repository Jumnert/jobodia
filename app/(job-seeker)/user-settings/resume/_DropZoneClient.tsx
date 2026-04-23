"use client";
import { useRouter } from "next/navigation";
import { UploadDropZone } from "@/services/uploadThing/components/uploadThing";

export function DropzoneClient({ hasResume }: { hasResume: boolean }) {
  const router = useRouter();

  return (
    <div className="space-y-3 py-6">
      <p className="text-sm text-muted-foreground">
        Upload a PDF resume up to 8MB. After upload, the app will generate an
        AI summary for employers.
      </p>
      <UploadDropZone
        endpoint="resumeUploader"
        onClientUploadComplete={() => router.refresh()}
        content={{
          label: hasResume ? "Update Resume" : "Choose a PDF or drag it here",
        }}
      />
    </div>
  );
}
