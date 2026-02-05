import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getOrganizationGlobalTag() {
  return getGlobalTag("Organizations");
}

export function getOrganizationIdTag(id: string) {
  return getIdTag("Organizations", id);
}

export function revalidateUserCache(id: string) {
  revalidateTag(getOrganizationGlobalTag(), "default");
  revalidateTag(getOrganizationIdTag(id), "default");
}
