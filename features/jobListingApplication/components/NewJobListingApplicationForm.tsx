"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MarkDownEditor } from "@/components/markdown/MarkDownEditor";
import { toast } from "sonner";
import { newJobListingApplicationSchema } from "../actions/schemas";
import { createJobListingApplication } from "../actions/actions";

import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";

export function NewJobListingApplicationForm({
  jobListingId,
}: {
  jobListingId: string;
}) {
  const form = useForm({
    resolver: zodResolver(newJobListingApplicationSchema),
    defaultValues: { coverLetter: "" },
  });

  async function onSubmit(
    data: z.infer<typeof newJobListingApplicationSchema>,
  ) {
    const results = await createJobListingApplication(jobListingId, data);

    if (results.error) {
      return toast.error(results.message);
    }
    toast.success(results.message);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-lg border">
          Your saved resume will be automatically included with this
          application.
        </div>
        <FormField
          name="coverLetter"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <MarkDownEditor {...field} markdown={field.value ?? ""} />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Submit Application
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
