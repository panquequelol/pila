import type { Language } from "../orquestrator/types";

// Translation resources for i18next
export const resources = {
  en: {
    translation: {
      // Archive view
      archiveNotice: "archives are deleted after 7 days",
      archiveEmpty: "no archived sections yet",
      restore: "restore",
      delete: "delete",
      nuke: "nuke",
      nukeConfirm: "delete all archives? this cannot be undone",

      // Settings
      size: "size",
      light: "light",
      dark: "dark",
      language: "language",
      settingsHere: "settings here",
      goBack: "go back",

      // Languages (for the selector)
      langEnglish: "English",
      langSpanish: "Español (Spanish)",
      langJapanese: "日本語 (Japanese)",
      langChinese: "中文 (Chinese)",

      // Empty state hint
      emptyHint: "type here. settings at",
    },
  },
  es: {
    translation: {
      // Archive view
      archiveNotice: "los archivos se eliminan después de 7 días",
      archiveEmpty: "no hay secciones archivadas aún",
      restore: "restaurar",
      delete: "eliminar",
      nuke: "eliminar todo",
      nukeConfirm: "¿eliminar todos los archivos? esto no se puede deshacer",

      // Settings
      size: "tamaño",
      light: "claro",
      dark: "oscuro",
      language: "idioma",
      settingsHere: "configuración aquí",
      goBack: "volver",

      // Languages (for the selector)
      langEnglish: "English (Inglés)",
      langSpanish: "Español",
      langJapanese: "日本語 (Japonés)",
      langChinese: "中文 (Chino)",

      // Empty state hint
      emptyHint: "escribe aquí. configuración en",
    },
  },
  ja: {
    translation: {
      // Archive view
      archiveNotice: "アーカイブは7日後に削除されます",
      archiveEmpty: "アーカイブされたセクションはまだありません",
      restore: "復元",
      delete: "削除",
      nuke: "全削除",
      nukeConfirm: "すべてのアーカイブを削除しますか？これは元に戻せません",

      // Settings
      size: "サイズ",
      light: "ライト",
      dark: "ダーク",
      language: "言語",
      settingsHere: "設定はこちら",
      goBack: "戻る",

      // Languages (for the selector)
      langEnglish: "English (英語)",
      langSpanish: "Español (スペイン語)",
      langJapanese: "日本語",
      langChinese: "中文 (中国語)",

      // Empty state hint
      emptyHint: "ここに入力。設定は",
    },
  },
  zh: {
    translation: {
      // Archive view
      archiveNotice: "存档将在7天后删除",
      archiveEmpty: "暂无存档部分",
      restore: "恢复",
      delete: "删除",
      nuke: "全部删除",
      nukeConfirm: "删除所有存档？此操作无法撤销",

      // Settings
      size: "大小",
      light: "浅色",
      dark: "深色",
      language: "语言",
      settingsHere: "设置在这里",
      goBack: "返回",

      // Languages (for the selector)
      langEnglish: "English (英语)",
      langSpanish: "Español (西班牙语)",
      langJapanese: "日本語 (日语)",
      langChinese: "中文",

      // Empty state hint
      emptyHint: "在此输入。设置在",
    },
  },
} as const;

// Default language (can be overridden by user settings)
export const defaultLanguage: Language = "en";

// Language metadata for display in settings
export const languages: Array<{
  code: Language;
  nativeName: string;
  englishName: string;
}> = [
  { code: "en", nativeName: "English", englishName: "English" },
  { code: "es", nativeName: "Español", englishName: "Spanish" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese" },
  { code: "zh", nativeName: "中文", englishName: "Chinese" },
];

// Type for translation keys (optional, for type safety)
export type TranslationKey = keyof typeof resources.en.translation;
