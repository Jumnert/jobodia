import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function NotificationsSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Notification Settings</h1>
      <div className="bg-card p-6 rounded-lg border">
        <p className="text-muted-foreground">
          Notification settings coming soon...
        </p>
      </div>
    </div>
  );
}
