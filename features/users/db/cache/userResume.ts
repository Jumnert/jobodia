import { getIdTag } from "@/lib/dataCache";

export function getUserResumeIdTag(userId: string) {
  return getIdTag("users", userId);
}
