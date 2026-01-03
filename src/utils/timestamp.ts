import { differenceInMinutes, differenceInHours, differenceInDays, format, type Locale } from "date-fns";
import { enUS, es, ja, zhCN } from "date-fns/locale";
import type { Language } from "../orquestrator/types";

const locales: Record<Language, Locale> = {
  en: enUS,
  es,
  ja,
  zh: zhCN,
};

const nowTranslations: Record<Language, string> = {
  en: "now",
  es: "ahora",
  ja: "今",
  zh: "刚刚",
};

export function getLocale(language: Language): Locale {
  return locales[language];
}

export function formatTimestamp(timestamp: number, language: Language): string {
  const now = Date.now();
  const mins = differenceInMinutes(now, timestamp);
  const hours = differenceInHours(now, timestamp);
  const days = differenceInDays(now, timestamp);
  const locale = locales[language];
  const nowText = nowTranslations[language];

  if (mins < 1) return nowText;
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;

  return format(timestamp, "MMM d", { locale });
}

export function formatArchiveTimestamp(timestamp: number, language: Language): string {
  return formatTimestamp(timestamp, language);
}
