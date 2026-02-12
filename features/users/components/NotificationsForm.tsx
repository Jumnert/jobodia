"use client";
import { UserNotificationSettingsTable } from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { revalidateUserNotificationSettingsCache } from "../db/cache/userNotificationSettings";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { toast } from "sonner";
import { updateUserNotificationSettings } from "../actions/userNotificationsSettings";
import { userNotificationSettingsSchema } from "../actions/schema";

export function NotificationsForm({
  notificationSettings,
}: {
  notificationSettings?: Pick<
    typeof UserNotificationSettingsTable.$inferSelect,
    "newJobEmailNotifications" | "aiPrompt"
  >;
}) {
  const form = useForm({
    resolver: zodResolver(userNotificationSettingsSchema),
    defaultValues: {
      aiPrompt: "",
      newJobEmailNotifications: false,
    },
  });

  async function onSubmit(
    data: z.infer<typeof userNotificationSettingsSchema>,
  ) {
    const result = await updateUserNotificationSettings(data);
    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  }

  const newJobEmailNotifications = form.watch("newJobEmailNotifications");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-lg p-4 shadow-sm space-y-6">
          <FormField
            name="newJobEmailNotifications"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Daily Email Notifications</FormLabel>
                    <FormDescription>
                      Receive email about job listings that match your interest
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          {newJobEmailNotifications && (
            <FormField
              name="aiPrompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-0.5">
                    <FormLabel>Filter Prompt</FormLabel>
                    <FormDescription>
                      Our AI Will use this promtp to filter job listings and
                      only send you Notifications for jobs that match your
                      critaria
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="min-h-32"
                      placeholder="Describe the jobs you're interested in. for exmaple: I'm looking for a remote frontend development positions taht use react and pay at lest $100k per year."
                    ></Textarea>
                  </FormControl>
                  <FormDescription>
                    Leave blank to get notified for all job listing.
                  </FormDescription>
                </FormItem>
              )}
            />
          )}
        </div>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Save Notification Settings
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
