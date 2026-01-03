import { useAtom, useSetAtom } from "jotai";
import { useState, useEffect } from "react";
import { archiveAtom, restoreSectionAtom, deleteArchiveAtom, clearAllArchivesAtom, viewModeAtom } from "../atoms/archive";
import { settingsAtom } from "../atoms/settings";
import { formatArchiveTimestamp } from "../utils/timestamp";
import { isPhone } from "../utils/device";
import { motion, AnimatePresence } from "motion/react";
import { SettingsPanel } from "./SettingsPanel";
import { useTranslation } from "react-i18next";

export const ArchiveView = () => {
  const [archive] = useAtom(archiveAtom);
  const restore = useSetAtom(restoreSectionAtom);
  const deleteArchive = useSetAtom(deleteArchiveAtom);
  const clearAllArchives = useSetAtom(clearAllArchivesAtom);
  const setViewMode = useSetAtom(viewModeAtom);
  const [settings] = useAtom(settingsAtom);
  const { t } = useTranslation();
  const [isPhoneDevice, setIsPhoneDevice] = useState(false);

  // Detect phone device on mount and when window resizes (debounced)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const checkPhone = () => setIsPhoneDevice(isPhone());
    const debouncedCheckPhone = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkPhone, 150);
    };
    checkPhone();
    window.addEventListener("resize", debouncedCheckPhone);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedCheckPhone);
    };
  }, []);

  const handleNuke = () => {
    if (window.confirm(t("nukeConfirm"))) {
      clearAllArchives();
    }
  };

  return (
    <div className="archive-view">
      <SettingsPanel />
      <div className="archive-header-row">
        <p className="archive-notice">{t("archiveNotice")}</p>
        {archive.length > 0 && (
          <button className="nuke-btn" onClick={handleNuke}>
            {t("nuke")}
          </button>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        {archive.length === 0 ? (
          <motion.p
            className="archive-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {t("archiveEmpty")}
          </motion.p>
        ) : (
          <div className="archive-sections">
            {archive.map((section, index) => (
              <motion.div
                key={section.id}
                className="archive-section"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="archive-header">
                  <span className="archive-date">
                    {formatArchiveTimestamp(section.archivedAt, settings.language)}
                  </span>
                  <div className="archive-actions">
                    <button
                      className="archive-btn restore"
                      onClick={() => restore(section.id)}
                    >
                      {t("restore")}
                    </button>
                    <button
                      className="archive-btn delete"
                      onClick={() => deleteArchive(section.id)}
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
                <div className="archive-items">
                  {section.lines.map((line) => (
                    <div key={line.id} className="archive-item">
                      <span className="archive-item-check">✓</span>
                      <span className="archive-item-text">{line.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      {isPhoneDevice && (
        <motion.button
          className="archive-back-btn"
          onClick={() => setViewMode("active")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t("goBack")}
        </motion.button>
      )}
    </div>
  );
};
