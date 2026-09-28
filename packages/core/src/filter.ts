import type { Mall } from "./malls";
import { getMallStatus } from "./status.ts";

export type MallStatusFilter = "all" | "open" | "closed";

export interface MallFilterOptions {
  country: string | null;
  query: string;
  status: MallStatusFilter;
  now?: Date;
}

export function filterMalls(
  malls: readonly Mall[],
  { country, query, status, now = new Date() }: MallFilterOptions,
): Mall[] {
  if (!country) return [];
  const normalizedQuery = query.trim().toLowerCase();

  return malls.filter((mall) => {
    if (mall.country !== country) return false;
    if (
      normalizedQuery &&
      !mall.name.toLowerCase().includes(normalizedQuery) &&
      !mall.city.toLowerCase().includes(normalizedQuery)
    ) return false;
    if (status === "all") return true;
    const mallStatus = getMallStatus(mall, now);
    return mallStatus.hoursValid && mallStatus.isOpen === (status === "open");
  });
}
