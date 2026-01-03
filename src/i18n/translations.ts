import type { Language } from "../orquestrator/types";

export type Translations = {
  // Archive view
  archiveNotice: string;
  archiveEmpty: string;
  restore: string;
  delete: string;
  nuke: string;
  nukeConfirm: string;

  // Settings
  size: string;
  light: string;
  dark: string;
  language: string;
  settingsHere: string;
  goBack: string;

  // Languages (for the selector)
  langEnglish: string;
  langSpanish: string;
  langJapanese: string;
  langChinese: string;

  // Empty state hint
  emptyHint: string;
};

export const translations: Record<Language, Translations> = {
  en: {
    archiveNotice: "archives are deleted after 7 days",
    archiveEmpty: "no archived sections yet",
    restore: "restore",
    delete: "delete",
    nuke: "nuke",
    nukeConfirm: "delete all archives? this cannot be undone",
    size: "size",
    light: "light",
    dark: "dark",
    language: "language",
    settingsHere: "settings here",
    goBack: "go back",
    langEnglish: "English",
    langSpanish: "Español (Spanish)",
    langJapanese: "日本語 (Japanese)",
    langChinese: "中文 (Chinese)",
    emptyHint: "type here. settings at",
  },
  es: {
    archiveNotice: "los archivos se eliminan después de 7 días",
    archiveEmpty: "no hay secciones archivadas aún",
    restore: "restaurar",
    delete: "eliminar",
    nuke: "eliminar todo",
    nukeConfirm: "¿eliminar todos los archivos? esto no se puede deshacer",
    size: "tamaño",
    light: "claro",
    dark: "oscuro",
    language: "idioma",
    settingsHere: "configuración aquí",
    goBack: "volver",
    langEnglish: "English (Inglés)",
    langSpanish: "Español",
    langJapanese: "日本語 (Japonés)",
    langChinese: "中文 (Chino)",
    emptyHint: "escribe aquí. configuración en",
  },
  ja: {
    archiveNotice: "アーカイブは7日後に削除されます",
    archiveEmpty: "アーカイブされたセクションはまだありません",
    restore: "復元",
    delete: "削除",
    nuke: "全削除",
    nukeConfirm: "すべてのアーカイブを削除しますか？これは元に戻せません",
    size: "サイズ",
    light: "ライト",
    dark: "ダーク",
    language: "言語",
    settingsHere: "設定はこちら",
    goBack: "戻る",
    langEnglish: "English (英語)",
    langSpanish: "Español (スペイン語)",
    langJapanese: "日本語",
    langChinese: "中文 (中国語)",
    emptyHint: "ここに入力。設定は",
  },
  zh: {
    archiveNotice: "存档将在7天后删除",
    archiveEmpty: "暂无存档部分",
    restore: "恢复",
    delete: "删除",
    nuke: "全部删除",
    nukeConfirm: "删除所有存档？此操作无法撤销",
    size: "大小",
    light: "浅色",
    dark: "深色",
    language: "语言",
    settingsHere: "设置在这里",
    goBack: "返回",
    langEnglish: "English (英语)",
    langSpanish: "Español (西班牙语)",
    langJapanese: "日本語 (日语)",
    langChinese: "中文",
    emptyHint: "在此输入。设置在",
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
