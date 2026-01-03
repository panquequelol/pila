import { atom } from "jotai";
import { storage } from "../orquestrator/storage";
import type { AppSettings, Language, DarkMode, TextSizeProfile } from "../orquestrator/types";
import { changeLanguage as changeI18nLanguage } from "../i18n/i18n";

export type { DarkMode, TextSizeProfile, Language } from "../orquestrator/types";

// Load initial settings from storage
const initialSettings = storage.getSettings();

// Read-only atom for settings
export const settingsAtom = atom<AppSettings>(initialSettings);

// Write-only atom for updating dark mode
export const setDarkModeAtom = atom(
  null,
  (get, set, darkMode: DarkMode) => {
    const current = get(settingsAtom);
    const updated = { ...current, darkMode };
    set(settingsAtom, updated);
    storage.setSettings(updated);
  }
);

// Write-only atom for updating text size
export const setTextSizeAtom = atom(
  null,
  (get, set, textSize: TextSizeProfile) => {
    const current = get(settingsAtom);
    const updated = { ...current, textSize };
    set(settingsAtom, updated);
    storage.setSettings(updated);
  }
);

// Write-only atom for updating language
export const setLanguageAtom = atom(
  null,
  (get, set, language: Language) => {
    const current = get(settingsAtom);
    const updated = { ...current, language };
    set(settingsAtom, updated);
    storage.setSettings(updated);

    // Set lang attribute on document
    document.documentElement.lang = language;

    // Sync with i18next
    changeI18nLanguage(language);
  }
);

// Initialize on app load - apply current settings to DOM
export const initializeSettingsAtom = atom(
  null,
  (get) => {
    const settings = get(settingsAtom);

    // Apply dark mode
    if (settings.darkMode === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    // Apply text size
    if (settings.textSize !== "normal") {
      document.documentElement.setAttribute("data-text-size", settings.textSize);
    }

    // Set lang attribute and sync with i18next
    document.documentElement.lang = settings.language;
    changeI18nLanguage(settings.language);
  }
);
