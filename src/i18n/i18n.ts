import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, defaultLanguage } from "./resources";
import type { Language } from "../orquestrator/types";

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // We'll handle loading states manually
    },
  });

// Export a function to change language that syncs with our settings
export const changeLanguage = (language: Language) => {
  i18n.changeLanguage(language);
};

// Export the i18n instance for direct access if needed
export { i18n };

// Get current language
export const getCurrentLanguage = (): Language => {
  return i18n.language as Language;
};
