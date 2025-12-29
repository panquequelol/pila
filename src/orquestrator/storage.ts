import SecureLS from "secure-ls";
import { STORAGE_KEY } from "./types";
import type { NotepadDocument } from "./types";

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
};
