import type { Translations } from "../i18n/translations";

export function formatTimestamp(timestamp: number, t: Translations): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t.justNow;
  if (diffMins < 60) return t.minsAgo(diffMins);
  if (diffHours < 24) return t.hoursAgo(diffHours);
  if (diffDays === 1) return t.yesterday;
  if (diffDays < 7) return t.daysAgo(diffDays);

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatArchiveTimestamp(timestamp: number, t: Translations): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t.archivedJustNow;
  if (diffMins < 60) return t.archivedMinsAgo(diffMins);
  if (diffHours < 24) return t.archivedHoursAgo(diffHours);
  if (diffDays === 1) return t.archivedYesterday;
  if (diffDays < 7) return t.archivedDaysAgo(diffDays);

  return `${t.archivedDaysAgoPrefix} ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}
