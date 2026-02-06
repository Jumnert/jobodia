// lib/datacache.ts
export function getGlobalTag(tag: string) {
  return `global:${tag}`;
}

export function getIdTag(entity: string, id: string) {
  return `${entity}:${id}`;
}

export function getOrganizationTag(tag: string, organizationId: string) {
  return `organization:${organizationId}-${tag}`;
}
