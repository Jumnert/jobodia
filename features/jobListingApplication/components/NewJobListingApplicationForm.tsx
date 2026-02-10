"use client";

import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
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
      toast.error(results.message);
    }
    toast.success(results.message);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        ></FormField>
      </form>
    </Form>
  );
}
