import SecureLS from "secure-ls";
import { subWeeks } from "date-fns";
import { STORAGE_KEY, ARCHIVE_STORAGE_KEY, SETTINGS_STORAGE_KEY, type NotepadDocument, type ArchivedSections, type ArchivedSection, type AppSettings } from "./types";

const ls = new SecureLS({ encodingType: "aes" });

// Simple debounce implementation (no external dependency)
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  }) as T;
}

// Sync set for immediate writes (e.g., on page unload)
const setSync = (document: NotepadDocument): void => {
  ls.set(STORAGE_KEY, JSON.stringify(document));
};

// Debounced save for performance - only writes to storage after user stops typing
export const debouncedSave = debounce((document: NotepadDocument) => {
  ls.set(STORAGE_KEY, JSON.stringify(document));
}, 500); // Save after 500ms of inactivity

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

  set: debouncedSave,

  // Immediate save for critical operations (like clearing data)
  setSync: setSync,

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
    const cutoff = subWeeks(Date.now(), 1).getTime();
    const current = storage.getArchive();
    const filtered = current.filter((section) => section.archivedAt > cutoff);

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
        return { darkMode: "light", textSize: "lsize", language: "en" };
      }
      const parsed = JSON.parse(data);
      // Merge with defaults for any missing fields (migration)
      return {
        darkMode: parsed.darkMode ?? "light",
        textSize: parsed.textSize ?? "lsize",
        language: parsed.language ?? "en",
      };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return { darkMode: "light", textSize: "lsize", language: "en" };
    }
  },

  setSettings: (settings: AppSettings): void => {
    ls.set(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  },
};
