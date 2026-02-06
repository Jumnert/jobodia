"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { jobListingSchema } from "../actions/schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
  FormatWageInterval,
} from "../lib/formatters";
import { ProvinceSelectItems } from "./provinceSelectIem";
import { MarkDownEditor } from "@/components/markdown/MarkDownEditor";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { createJobListing, updateJobListing } from "../actions/actions";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const NONE_SELECT_VALUE = "none";
export function JobListingForm({
  jobListing,
}: {
  jobListing?: Pick<
    typeof JobListingTable.$inferSelect,
    | "title"
    | "description"
    | "experienceLevel"
    | "id"
    | "stateAbbreviation"
    | "type"
    | "wage"
    | "wageInterval"
    | "city"
    | "locationRequirement"
  >;
}) {
  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: jobListing ?? {
      title: "",
      description: "",
      stateAbbreviation: "",
      city: null,
      wage: null,
      wageInterval: null,
      experienceLevel: "junior",
      type: "full-time",
      locationRequirement: "in-office",
    },
  });

  async function onSubmit(data: z.infer<typeof jobListingSchema>) {
    const action = jobListing
      ? updateJobListing.bind(null, jobListing.id)
      : createJobListing;
    const res = await action(data);
    if (res.error) {
      toast.error(res.message);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 @container"
      >
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4  gap-y-6 items-start">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="wage"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wage</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? ""}
                      className="rounded-r-none no-spinner"
                      onChange={(e) =>
                        field.onChange(
                          isNaN(e.target.valueAsNumber)
                            ? undefined
                            : e.target.valueAsNumber,
                        )
                      }
                    ></Input>
                  </FormControl>
                  <FormField
                    name="wageInterval"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(val) => field.onChange(val ?? null)}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-l-none">
                              <span className="mr-1">/</span>
                              <SelectValue placeholder="interval" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {wageIntervals.map((interval) => (
                              <SelectItem key={interval} value={interval}>
                                {FormatWageInterval(interval)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4  gap-y-6 items-start">
          <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-2  gap-y-6 items-start">
            <FormField
              name="city"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="stateAbbreviation"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) =>
                      field.onChange(val === NONE_SELECT_VALUE ? null : val)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {field.value != null && (
                        <SelectItem
                          value={NONE_SELECT_VALUE}
                          className="text-muted-foreground"
                        >
                          Clear
                        </SelectItem>
                      )}

                      <ProvinceSelectItems />
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="locationRequirement"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localtion Requirment</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {locationRequirements.map((lr) => (
                      <SelectItem key={lr} value={lr}>
                        {formatLocationRequirement(lr)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4  gap-y-6 items-start">
          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {jobListingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatJobType(type)}
                      </SelectItem>
                    ))}

                    <ProvinceSelectItems />
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="experienceLevel"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {experienceLevels.map((experience) => (
                      <SelectItem key={experience} value={experience}>
                        {formatExperienceLevel(experience)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <MarkDownEditor {...field} markdown={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            {" "}
            Create Job Listing
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
