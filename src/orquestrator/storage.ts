import SecureLS from "secure-ls";
import { STORAGE_KEY, ARCHIVE_STORAGE_KEY, SETTINGS_STORAGE_KEY, type NotepadDocument, type ArchivedSections, type ArchivedSection, type AppSettings } from "./types";

const ls = new SecureLS({ encodingType: "aes" });

export const storage = {
  get: (): NotepadDocument => {
    try {
      const data = ls.get(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load from storage:", error);
      return [];
    }
  },

  set: (document: NotepadDocument): void => {
    ls.set(STORAGE_KEY, JSON.stringify(document));
  },

  clear: (): void => {
    ls.remove(STORAGE_KEY);
  },

  // Archive storage methods
  getArchive: (): ArchivedSections => {
    try {
      const data = ls.get(ARCHIVE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load archive:", error);
      return [];
    }
  },

  setArchive: (archive: ArchivedSections): void => {
    ls.set(ARCHIVE_STORAGE_KEY, JSON.stringify(archive));
  },

  addToArchive: (section: ArchivedSection): ArchivedSections => {
    const current = storage.getArchive();
    const updated = [section, ...current];
    storage.setArchive(updated);
    return updated;
  },

  updateArchive: (archive: ArchivedSections): void => {
    storage.setArchive(archive);
  },

  cleanOldArchives: (): ArchivedSections => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const current = storage.getArchive();
    const filtered = current.filter((section) => section.archivedAt > oneWeekAgo);

    if (filtered.length !== current.length) {
      storage.setArchive(filtered);
    }

    return filtered;
  },

  // Settings storage methods
  getSettings: (): AppSettings => {
    try {
      const data = ls.get(SETTINGS_STORAGE_KEY);
      if (!data) {
        return { darkMode: "light", textSize: "normal", language: "en" };
      }
      const parsed = JSON.parse(data);
      // Merge with defaults for any missing fields (migration)
      return {
        darkMode: parsed.darkMode ?? "light",
        textSize: parsed.textSize ?? "normal",
        language: parsed.language ?? "en",
      };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return { darkMode: "light", textSize: "normal", language: "en" };
    }
  },

  setSettings: (settings: AppSettings): void => {
    ls.set(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  },
};
