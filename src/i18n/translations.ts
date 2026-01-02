import type { Language } from "../orquestrator/types";

export type Translations = {
  // Archive view
  archiveNotice: string;
  archiveEmpty: string;
  restore: string;
  delete: string;

  // Settings
  size: string;
  light: string;
  dark: string;
  language: string;

  // Languages (for the selector)
  langEnglish: string;
  langSpanish: string;
  langJapanese: string;
  langChinese: string;

  // Empty state hint
  emptyHint: string;

  // Timestamps
  justNow: string;
  minsAgo: (mins: number) => string;
  hoursAgo: (hours: number) => string;
  daysAgo: (days: number) => string;
  yesterday: string;
  archivedJustNow: string;
  archivedMinsAgo: (mins: number) => string;
  archivedHoursAgo: (hours: number) => string;
  archivedDaysAgo: (days: number) => string;
  archivedYesterday: string;
  archivedDaysAgoPrefix: string;
};

export const translations: Record<Language, Translations> = {
  en: {
    archiveNotice: "archives are deleted after 7 days",
    archiveEmpty: "no archived sections yet",
    restore: "restore",
    delete: "delete",
    size: "size",
    light: "light",
    dark: "dark",
    language: "language",
    langEnglish: "English",
    langSpanish: "Español (Spanish)",
    langJapanese: "日本語 (Japanese)",
    langChinese: "中文 (Chinese)",
    emptyHint: "type here. settings at",
    justNow: "just now",
    minsAgo: (mins) => `updated ${mins}m ago`,
    hoursAgo: (hours) => `updated ${hours}h ago`,
    daysAgo: (days) => `updated ${days}d ago`,
    yesterday: "updated yesterday",
    archivedJustNow: "archived just now",
    archivedMinsAgo: (mins) => `archived ${mins}m ago`,
    archivedHoursAgo: (hours) => `archived ${hours}h ago`,
    archivedDaysAgo: (days) => `archived ${days}d ago`,
    archivedYesterday: "archived yesterday",
    archivedDaysAgoPrefix: "archived",
  },
  es: {
    archiveNotice: "los archivos se eliminan después de 7 días",
    archiveEmpty: "no hay secciones archivadas aún",
    restore: "restaurar",
    delete: "eliminar",
    size: "tamaño",
    light: "claro",
    dark: "oscuro",
    language: "idioma",
    langEnglish: "English (Inglés)",
    langSpanish: "Español",
    langJapanese: "日本語 (Japonés)",
    langChinese: "中文 (Chino)",
    emptyHint: "escribe aquí. configuración en",
    justNow: "ahora mismo",
    minsAgo: (mins) => `actualizado hace ${mins}m`,
    hoursAgo: (hours) => `actualizado hace ${hours}h`,
    daysAgo: (days) => `actualizado hace ${days}d`,
    yesterday: "actualizado ayer",
    archivedJustNow: "archivado ahora mismo",
    archivedMinsAgo: (mins) => `archivado hace ${mins}m`,
    archivedHoursAgo: (hours) => `archivado hace ${hours}h`,
    archivedDaysAgo: (days) => `archivado hace ${days}d`,
    archivedYesterday: "archivado ayer",
    archivedDaysAgoPrefix: "archivado",
  },
  ja: {
    archiveNotice: "アーカイブは7日後に削除されます",
    archiveEmpty: "アーカイブされたセクションはまだありません",
    restore: "復元",
    delete: "削除",
    size: "サイズ",
    light: "ライト",
    dark: "ダーク",
    language: "言語",
    langEnglish: "English (英語)",
    langSpanish: "Español (スペイン語)",
    langJapanese: "日本語",
    langChinese: "中文 (中国語)",
    emptyHint: "ここに入力。設定は",
    justNow: "たった今",
    minsAgo: (mins) => `${mins}分前に更新`,
    hoursAgo: (hours) => `${hours}時間前に更新`,
    daysAgo: (days) => `${days}日前に更新`,
    yesterday: "昨日更新",
    archivedJustNow: "たった今アーカイブ",
    archivedMinsAgo: (mins) => `${mins}分前にアーカイブ`,
    archivedHoursAgo: (hours) => `${hours}時間前にアーカイブ`,
    archivedDaysAgo: (days) => `${days}日前にアーカイブ`,
    archivedYesterday: "昨日アーカイブ",
    archivedDaysAgoPrefix: "アーカイブ",
  },
  zh: {
    archiveNotice: "存档将在7天后删除",
    archiveEmpty: "暂无存档部分",
    restore: "恢复",
    delete: "删除",
    size: "大小",
    light: "浅色",
    dark: "深色",
    language: "语言",
    langEnglish: "English (英语)",
    langSpanish: "Español (西班牙语)",
    langJapanese: "日本語 (日语)",
    langChinese: "中文",
    emptyHint: "在此输入。设置在",
    justNow: "刚刚",
    minsAgo: (mins) => `${mins}分钟前更新`,
    hoursAgo: (hours) => `${hours}小时前更新`,
    daysAgo: (days) => `${days}天前更新`,
    yesterday: "昨天更新",
    archivedJustNow: "刚刚存档",
    archivedMinsAgo: (mins) => `${mins}分钟前存档`,
    archivedHoursAgo: (hours) => `${hours}小时前存档`,
    archivedDaysAgo: (days) => `${days}天前存档`,
    archivedYesterday: "昨天存档",
    archivedDaysAgoPrefix: "存档",
  },
};

export const useTranslations = (language: Language): Translations => {
  return translations[language];
};

// Language metadata for display
export const languages: Array<{ code: Language; nativeName: string; englishName: string }> = [
  { code: "en", nativeName: "English", englishName: "English" },
  { code: "es", nativeName: "Español", englishName: "Spanish" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese" },
  { code: "zh", nativeName: "中文", englishName: "Chinese" },
];
