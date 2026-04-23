"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserResumeAction } from "@/features/users/actions/resumes";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const MAX_POLL_ATTEMPTS = 20;

export function AISummaryPoller() {
  const [status, setStatus] = useState<"processing" | "delayed">("processing");
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;

    const interval = setInterval(async () => {
      try {
        const resume = await getUserResumeAction();

        if (resume?.aiSummary) {
          router.refresh();
          clearInterval(interval);
          return;
        }

        attempts += 1;
        if (attempts >= MAX_POLL_ATTEMPTS) {
          setStatus("delayed");
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Failed to check AI summary status:", error);
        setStatus("delayed");
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "processing" ? (
            <>
              <Loader2 className="size-4 animate-spin text-primary" />
              AI is analyzing your resume...
            </>
          ) : (
            <>AI summary is delayed</>
          )}
        </CardTitle>
        <CardDescription>
          {status === "processing"
            ? "Our AI is extracting skills and experience from your resume. This usually takes 10-20 seconds."
            : "Your resume upload may have succeeded, but the summary job did not finish. Make sure you uploaded a PDF and check that UploadThing, Inngest, and GROQ environment variables are configured."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
