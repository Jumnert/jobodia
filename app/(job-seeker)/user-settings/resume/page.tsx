import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

export default function UserResumePage() {
  return (
    <div className="@max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold tracking-tight">Upload Your Resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient />
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
async function AISummaryCard() {
  return null;
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
