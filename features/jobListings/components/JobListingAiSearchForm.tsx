"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobListingAiSearchFormSchema } from "../actions/schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
} from "@/components/ui/form";
import z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSwap } from "@/components/LoadingSwap";
import { Button } from "@/components/ui/button";
import { getAiJobListingSearchResults } from "../actions/actions";
import { useRouter } from "next/navigation";

export function JobListingAiSearchForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(jobListingAiSearchFormSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(data: z.infer<typeof jobListingAiSearchFormSchema>) {
    const results = await getAiJobListingSearchResults(data);
    if (results.error) {
      console.error(results.error);
      return;
    }
    const params = new URLSearchParams();
    results.jobIds.forEach((jobId) => params.append("jobIds", jobId));
    router.push(`/?${params.toString()}`); // Changed from router.push`/?${params.toString()}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="query"
          control={form.control}
          render={({ field }) => (
            <>
              <FormLabel>Query</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-32" />
              </FormControl>
              <FormDescription>
                Provide a description of the job you are looking for, as well as
                your experience / skills. The more specific you are, the better
                the results will be.
              </FormDescription>
            </>
          )}
        />
        <Button
          className="w-full"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Search
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
