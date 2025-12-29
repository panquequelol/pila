import { storage } from "./storage";
import type { NotepadDocument, TodoLine } from "./types";

export const documentService = {
  load: (): NotepadDocument => {
    return storage.get();
  },

  save: (document: NotepadDocument): void => {
    storage.set(document);
  },

  toggleLine: (document: NotepadDocument, lineId: string): NotepadDocument => {
    return document.map((line) =>
      line.id === lineId
        ? { ...line, state: line.state === "DONE" ? "TODO" : "DONE" }
        : line
    );
  },

  updateLineText: (
    document: NotepadDocument,
    lineId: string,
    text: string
  ): NotepadDocument => {
    return document.map((line) =>
      line.id === lineId ? { ...line, text } : line
    );
  },

  addLine: (document: NotepadDocument, text: string = ""): NotepadDocument => {
    const newLine: TodoLine = {
      id: crypto.randomUUID(),
      text,
      state: "TODO",
    };
    return [...document, newLine];
  },

  deleteLine: (document: NotepadDocument, lineId: string): NotepadDocument => {
    return document.filter((line) => line.id !== lineId);
  },
};
