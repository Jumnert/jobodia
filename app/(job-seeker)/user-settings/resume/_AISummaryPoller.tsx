"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserResumeAction } from "@/features/users/actions/resumes";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function AISummaryPoller({ userId }: { userId: string }) {
  // If we are showing this component, it's because the summary is missing.
  // So we SHOULD be in the processing state immediately.
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const resume = await getUserResumeAction();

      // If a summary finally exists, we are done!
      if (resume?.aiSummary) {
        setIsProcessing(false);
        router.refresh();
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  if (!isProcessing) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          AI is analyzing your resume...
        </CardTitle>
        <CardDescription>
          Our AI is currently extracting skills and experience from your resume.
          This usually takes 10-20 seconds.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
