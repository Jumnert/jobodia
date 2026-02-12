import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import { DropzoneClient } from "./_DropZoneClient";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cacheTag } from "next/cache";
import { getUserResumeIdTag } from "@/features/users/db/cache/userResume";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/drizzle/schema";
import { MarkDownRenderer } from "@/components/markdown/MarkDownRenderer";

export default async function UserResumePage() {
  const { userId } = await getCurrentUser();
  const hasResume = userId
    ? await db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
        columns: { userId: true },
      }).then((res) => !!res)
    : false;

  return (
    <div className="@max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold tracking-tight">Upload Your Resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient hasResume={hasResume} />
        </CardContent>
        <Suspense>
          <ResumeDetails />
        </Suspense>
      </Card>
      <Suspense>
        <AISummaryCard />
      </Suspense>
    </div>
  );
}

async function ResumeDetails() {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const userResume = await getUserResume(userId);
  if (userResume == null) return null;
  return (
    <CardFooter>
      <Button asChild>
        <Link
          href={userResume.resumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Resume
        </Link>
      </Button>
    </CardFooter>
  );
}
import { AISummaryPoller } from "./_AISummaryPoller";

async function AISummaryCard() {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const userResume = await getUserResume(userId);
  if (userResume == null) return null;

  if (userResume.aiSummary == null) {
    return <AISummaryPoller userId={userId} />;
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>AI Summary</CardTitle>
        <CardDescription>
          This is an AI generated summary of your resume. This is used by
          employers to get a quick overview of your resume.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <MarkDownRenderer source={userResume.aiSummary} />
      </CardContent>
    </Card>
  );
}

async function getUserResume(userId: string) {
  // "use cache";
  // cacheTag(getUserResumeIdTag(userId));
  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    // columns: {
    //   resumeFileUrl: true,
    // },
  });
}
