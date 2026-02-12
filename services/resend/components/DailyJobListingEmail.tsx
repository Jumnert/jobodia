import { JobListingTable } from "@/drizzle/schema";
import {
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import tailwindConfig from "../data/tailwindConfig";
import {
  formatExperienceLevel,
  formatJobListingLocation,
  formatJobType,
  formatLocationRequirement,
  formatWage,
} from "@/features/jobListings/lib/formatters";

type JobListing = Pick<
  typeof JobListingTable.$inferSelect,
  | "id"
  | "title"
  | "city"
  | "stateAbbreviation"
  | "type"
  | "experienceLevel"
  | "wage"
  | "wageInterval"
  | "locationRequirement"
> & {
  organizationName: string;
};

export default function DailyJobListingEmail({
  jobListings,
  serverUrl,
  userName,
}: {
  userName: string;
  jobListings: JobListing[];
  serverUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Tailwind config={tailwindConfig}>
        <Container className="mx-auto py-8 px-4 max-w-2xl bg-gray-50">
          <Section className="text-center mb-8 bg-white rounded-lg p-6 ">
            <Text className="text-xl m-0">JOBODIA.Inc</Text>
            <Heading className="text-3xl font-bold text-gray-900 mb-2 mt-0">
              New Job Listings!
            </Heading>
            <Text className="text-base text-gray-600 m-0">
              Hi {userName}, here are all the new job listings that match your
              criteria.
            </Text>
          </Section>

          {jobListings.map((jobListing) => (
            <Section
              key={jobListing.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4"
            >
              <Heading className="text-2xl font-bold text-gray-900 mb-1 mt-0">
                {jobListing.title}
              </Heading>

              <Text className="text-base font-medium text-gray-600 mb-5 mt-0">
                {jobListing.organizationName}
              </Text>

              <Section className="mb-6">
                {getBadges(jobListing).map((badge, index) => (
                  <Text
                    key={index}
                    className="inline-block mr-2 mb-2 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {badge}
                  </Text>
                ))}
              </Section>

              <Button
                href={`${serverUrl}/jobs/${jobListing.id}`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-slate-50 h-10 px-4 py-2 w-full"
              >
                View Job Details →
              </Button>
            </Section>
          ))}

          <Hr className="border-gray-300 my-8" />
          <Section className="text-center bg-white rounded-lg p-4">
            <Text className="text-xs text-gray-500 m-0 mb-2">
              You&apos;re receiving this email because you&apos;ve subscribed to
              job alerts.
            </Text>
            <Text className="text-xl m-0">JOBODIA.Inc</Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}

function getBadges(jobListing: JobListing) {
  const badges = [
    formatLocationRequirement(jobListing.locationRequirement),
    formatJobType(jobListing.type),
    formatExperienceLevel(jobListing.experienceLevel),
  ];
  if (jobListing.city != null || jobListing.stateAbbreviation != null) {
    badges.unshift(formatJobListingLocation(jobListing));
  }
  if (jobListing.wage != null && jobListing.wageInterval != null) {
    badges.unshift(formatWage(jobListing.wage, jobListing.wageInterval));
  }
  return badges;
}

DailyJobListingEmail.PreviewProps = {
  jobListings: [
    {
      city: "dwa",
      stateAbbreviation: "KCM",
      title: "DevOps",
      wage: 2343,
      wageInterval: null,
      experienceLevel: "junior",
      type: "full-time",
      id: "d57f2e48-61a2-4d1d-891d-f2aeab8c9a2b",
      organizationName: "Tech Corp",
      locationRequirement: "remote",
    },
    {
      city: "g",
      stateAbbreviation: "KPC",
      title: "Frontend Developer",
      wage: null,
      wageInterval: null,
      experienceLevel: "junior",
      type: "full-time",
      id: "da8f4da4-0328-4bd3-a2c1-aaf374a48ddb",
      organizationName: "Web Solutions",
      locationRequirement: "in-office",
    },
  ],
  userName: "John Doe",
  serverUrl: "http://localhost:3000",
} satisfies Parameters<typeof DailyJobListingEmail>[0];
