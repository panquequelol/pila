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
import { useTranslation } from "react-i18next";
import { languages } from "../i18n/resources";

export const SettingsPanel = () => {
  const [settings] = useAtom(settingsAtom);
  const setDarkMode = useSetAtom(setDarkModeAtom);
  const setTextSize = useSetAtom(setTextSizeAtom);
  const setLanguage = useSetAtom(setLanguageAtom);
  const { t } = useTranslation();

  const handleDarkModeChange = (mode: DarkMode) => {
    setDarkMode(mode);
  };

  const handleTextSizeChange = (size: TextSizeProfile) => {
    setTextSize(size);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="settings-panel">
      {/* Dark Mode Buttons */}
      <div className="setting-row">
        <div className="mode-options">
          <button
            className={`mode-btn ${settings.darkMode === "light" ? "active" : ""}`}
            onClick={() => handleDarkModeChange("light")}
            aria-label="Light mode"
          >
            {t("light")}
          </button>
          <button
            className={`mode-btn ${settings.darkMode === "dark" ? "active" : ""}`}
            onClick={() => handleDarkModeChange("dark")}
            aria-label="Dark mode"
          >
            {t("dark")}
          </button>
        </div>
      </div>

      {/* Size Selector */}
      <div className="setting-row">
        <span className="setting-label">{t("size")}</span>
        <div className="size-options">
          <button
            className={`size-btn ${settings.textSize === "lsize" ? "active" : ""}`}
            onClick={() => handleTextSizeChange("lsize")}
            aria-label="Large"
          >
            L
          </button>
          <button
            className={`size-btn ${settings.textSize === "xlsize" ? "active" : ""}`}
            onClick={() => handleTextSizeChange("xlsize")}
            aria-label="Extra large"
          >
            XL
          </button>
          <button
            className={`size-btn ${settings.textSize === "xxlsize" ? "active" : ""}`}
            onClick={() => handleTextSizeChange("xxlsize")}
            aria-label="Extra extra large"
          >
            XXL
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="setting-row">
        <span className="setting-label">{t("language")}</span>
        <select
          className="language-select"
          value={settings.language}
          onChange={handleLanguageChange}
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
