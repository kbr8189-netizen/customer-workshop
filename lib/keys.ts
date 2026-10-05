import { GROUPS } from "@/lib/workshop";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const PERSONAL_PREFIX = "personal/";
export const TEAM_PREFIX = "team/";

export function personalKey(id: string) {
  return UUID.test(id) ? `${PERSONAL_PREFIX}${id}.json` : null;
}

export function teamKey(group: string) {
  const i = GROUPS.indexOf(group);
  return i < 0 ? null : `${TEAM_PREFIX}${i + 1}.json`;
}
