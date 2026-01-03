import { useAtom, useSetAtom } from "jotai";
import { useState, useEffect } from "react";
import { archiveAtom, restoreSectionAtom, deleteArchiveAtom, clearAllArchivesAtom, viewModeAtom } from "../atoms/archive";
import { settingsAtom } from "../atoms/settings";
import { formatArchiveTimestamp } from "../utils/timestamp";
import { isPhone } from "../utils/device";
import { motion, AnimatePresence } from "motion/react";
import { SettingsPanel } from "./SettingsPanel";
import { useTranslations } from "../i18n/translations";

export const ArchiveView = () => {
  const [archive] = useAtom(archiveAtom);
  const restore = useSetAtom(restoreSectionAtom);
  const deleteArchive = useSetAtom(deleteArchiveAtom);
  const clearAllArchives = useSetAtom(clearAllArchivesAtom);
  const setViewMode = useSetAtom(viewModeAtom);
  const [settings] = useAtom(settingsAtom);
  const t = useTranslations(settings.language);
  const [isPhoneDevice, setIsPhoneDevice] = useState(false);

  // Detect phone device on mount and when window resizes
  useEffect(() => {
    const checkPhone = () => setIsPhoneDevice(isPhone());
    checkPhone();
    window.addEventListener("resize", checkPhone);
    return () => window.removeEventListener("resize", checkPhone);
  }, []);

  const handleNuke = () => {
    if (window.confirm(t.nukeConfirm)) {
      clearAllArchives();
    }
  };

  return (
    <div className="w-full">
      <SettingsPanel />
      <div className="flex justify-between items-center mb-4">
        <p
          className="m-0 lowercase"
          style={{
            fontSize: "var(--base-font-size)",
            color: "var(--color-text-placeholder)",
          }}
        >
          {t.archiveNotice}
        </p>
        {archive.length > 0 && (
          <motion.button
            className="border rounded px-2 py-1 cursor-pointer transition-all duration-200"
            style={{
              borderColor: "var(--color-archive-border)",
              background: "transparent",
              fontSize: "var(--base-font-size)",
              fontFamily: "inherit",
              textTransform: "lowercase",
              color: "var(--color-keyword)",
            }}
            whileHover={{ background: "var(--color-archive-border)" }}
            onClick={handleNuke}
          >
            {t.nuke}
          </motion.button>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        {archive.length === 0 ? (
          <motion.p
            className="lowercase"
            style={{
              color: "var(--color-text-placeholder)",
              fontSize: "var(--base-font-size)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {t.archiveEmpty}
          </motion.p>
        ) : (
          <div className="flex flex-col gap-4">
            {archive.map((section, index) => (
              <motion.div
                key={section.id}
                className="rounded-xl p-3"
                style={{ background: "var(--color-archive-bg)" }}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="lowercase"
                    style={{
                      fontSize: "var(--base-font-size)",
                      color: "var(--color-text-light)",
                    }}
                  >
                    {formatArchiveTimestamp(section.archivedAt, t)}
                  </span>
                  <div className="flex gap-2">
                    <motion.button
                      className="border-none bg-transparent cursor-pointer rounded px-2 py-1 lowercase transition-colors duration-200"
                      style={{
                        fontSize: "var(--base-font-size)",
                        fontFamily: "inherit",
                        color: "var(--color-text)",
                      }}
                      whileHover={{ background: "#DAD8CE" }}
                      onClick={() => restore(section.id)}
                    >
                      {t.restore}
                    </motion.button>
                    <motion.button
                      className="border-none bg-transparent cursor-pointer rounded px-2 py-1 lowercase transition-colors duration-200"
                      style={{
                        fontSize: "var(--base-font-size)",
                        fontFamily: "inherit",
                        color: "var(--color-keyword)",
                      }}
                      whileHover={{ background: "#E6D2D0" }}
                      onClick={() => deleteArchive(section.id)}
                    >
                      {t.delete}
                    </motion.button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {section.lines.map((line) => (
                    <div key={line.id} className="flex items-center gap-2">
                      <span
                        style={{
                          fontSize: "var(--base-font-size)",
                          color: "var(--color-text-light)",
                        }}
                      >
                        ✓
                      </span>
                      <span
                        className="lowercase"
                        style={{
                          fontSize: "var(--base-font-size)",
                          color: "var(--color-text-light)",
                        }}
                      >
                        {line.text}
                      </span>
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
          className="fixed bottom-4 left-1/2 -translate-x-1/2 border rounded text-center z-[1000] px-2 py-2 cursor-pointer transition-all duration-200"
          style={{
            borderColor: "var(--color-archive-border)",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
            fontSize: "var(--base-font-size)",
            fontFamily: "inherit",
            textTransform: "lowercase",
          }}
          whileHover={{ backgroundColor: "var(--color-archive-border)" }}
          onClick={() => setViewMode("active")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t.goBack}
        </motion.button>
      )}
    </div>
  );
};
