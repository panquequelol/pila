import { useAtom, useSetAtom } from "jotai";
import {
  settingsAtom,
  setDarkModeAtom,
  setTextSizeAtom,
  setLanguageAtom,
  type TextSizeProfile,
  type DarkMode,
  type Language,
} from "../atoms/settings";
import { useTranslations, languages } from "../i18n/translations";

export const SettingsPanel = () => {
  const [settings] = useAtom(settingsAtom);
  const setDarkMode = useSetAtom(setDarkModeAtom);
  const setTextSize = useSetAtom(setTextSizeAtom);
  const setLanguage = useSetAtom(setLanguageAtom);
  const t = useTranslations(settings.language);

  const handleDarkModeChange = (mode: DarkMode) => {
    setDarkMode(mode);
  };

  const handleTextSizeChange = (size: TextSizeProfile) => {
    setTextSize(size);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const modeBtnBase = "flex-1 border rounded cursor-pointer px-2 py-2 lowercase transition-all duration-200";
  const sizeBtnBase = "flex-1 min-w-[44px] aspect-square border rounded cursor-pointer p-0 lowercase transition-all duration-200 flex items-center justify-center";

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Dark Mode Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 w-full">
          <button
            className={`${modeBtnBase} ${settings.darkMode === "light" ? "active" : ""}`}
            style={{
              borderColor: "var(--color-archive-border)",
              background: settings.darkMode === "light" ? "var(--color-text)" : "transparent",
              color: settings.darkMode === "light" ? "var(--color-bg)" : "var(--color-text)",
              fontSize: "var(--base-font-size)",
              fontFamily: "inherit",
            }}
            onClick={() => handleDarkModeChange("light")}
            onMouseEnter={(e) => {
              if (settings.darkMode !== "light") e.currentTarget.style.background = "var(--color-archive-border)";
            }}
            onMouseLeave={(e) => {
              if (settings.darkMode !== "light") e.currentTarget.style.background = "transparent";
            }}
            aria-label="Light mode"
          >
            {t.light}
          </button>
          <button
            className={`${modeBtnBase} ${settings.darkMode === "dark" ? "active" : ""}`}
            style={{
              borderColor: "var(--color-archive-border)",
              background: settings.darkMode === "dark" ? "var(--color-text)" : "transparent",
              color: settings.darkMode === "dark" ? "var(--color-bg)" : "var(--color-text)",
              fontSize: "var(--base-font-size)",
              fontFamily: "inherit",
            }}
            onClick={() => handleDarkModeChange("dark")}
            onMouseEnter={(e) => {
              if (settings.darkMode !== "dark") e.currentTarget.style.background = "var(--color-archive-border)";
            }}
            onMouseLeave={(e) => {
              if (settings.darkMode !== "dark") e.currentTarget.style.background = "transparent";
            }}
            aria-label="Dark mode"
          >
            {t.dark}
          </button>
        </div>
      </div>

      {/* Size Selector */}
      <div className="flex justify-between items-center">
        <span
          className="lowercase"
          style={{
            fontSize: "var(--base-font-size)",
            color: "var(--color-text)",
          }}
        >
          {t.size}
        </span>
        <div className="flex gap-2">
          <button
            className={`${sizeBtnBase} ${settings.textSize === "lsize" ? "active" : ""}`}
            style={{
              borderColor: "var(--color-archive-border)",
              background: settings.textSize === "lsize" ? "var(--color-text)" : "transparent",
              color: settings.textSize === "lsize" ? "var(--color-bg)" : "var(--color-text)",
              fontSize: "var(--base-font-size)",
              fontFamily: "inherit",
            }}
            onClick={() => handleTextSizeChange("lsize")}
            onMouseEnter={(e) => {
              if (settings.textSize !== "lsize") e.currentTarget.style.background = "var(--color-archive-border)";
            }}
            onMouseLeave={(e) => {
              if (settings.textSize !== "lsize") e.currentTarget.style.background = "transparent";
            }}
            aria-label="Large"
          >
            L
          </button>
          <button
            className={`${sizeBtnBase} ${settings.textSize === "xlsize" ? "active" : ""}`}
            style={{
              borderColor: "var(--color-archive-border)",
              background: settings.textSize === "xlsize" ? "var(--color-text)" : "transparent",
              color: settings.textSize === "xlsize" ? "var(--color-bg)" : "var(--color-text)",
              fontSize: "var(--base-font-size)",
              fontFamily: "inherit",
            }}
            onClick={() => handleTextSizeChange("xlsize")}
            onMouseEnter={(e) => {
              if (settings.textSize !== "xlsize") e.currentTarget.style.background = "var(--color-archive-border)";
            }}
            onMouseLeave={(e) => {
              if (settings.textSize !== "xlsize") e.currentTarget.style.background = "transparent";
            }}
            aria-label="Extra large"
          >
            XL
          </button>
          <button
            className={`${sizeBtnBase} ${settings.textSize === "xxlsize" ? "active" : ""}`}
            style={{
              borderColor: "var(--color-archive-border)",
              background: settings.textSize === "xxlsize" ? "var(--color-text)" : "transparent",
              color: settings.textSize === "xxlsize" ? "var(--color-bg)" : "var(--color-text)",
              fontSize: "var(--base-font-size)",
              fontFamily: "inherit",
            }}
            onClick={() => handleTextSizeChange("xxlsize")}
            onMouseEnter={(e) => {
              if (settings.textSize !== "xxlsize") e.currentTarget.style.background = "var(--color-archive-border)";
            }}
            onMouseLeave={(e) => {
              if (settings.textSize !== "xxlsize") e.currentTarget.style.background = "transparent";
            }}
            aria-label="Extra extra large"
          >
            XXL
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex justify-between items-center">
        <span
          className="lowercase"
          style={{
            fontSize: "var(--base-font-size)",
            color: "var(--color-text)",
          }}
        >
          {t.language}
        </span>
        <select
          className="border rounded cursor-pointer px-2 py-1 lowercase transition-all duration-200 outline-none"
          style={{
            borderColor: "var(--color-archive-border)",
            background: "transparent",
            fontSize: "var(--base-font-size)",
            fontFamily: "inherit",
            color: "var(--color-text)",
          }}
          value={settings.language}
          onChange={handleLanguageChange}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-archive-border)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-keyword)"}
          onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-archive-border)"}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.englishName})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
