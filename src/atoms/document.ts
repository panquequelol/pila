import { atom } from "jotai";
import type { NotepadDocument } from "../orquestrator";
import { documentService } from "../orquestrator";

const initialDocument: NotepadDocument = documentService.load();

export const documentAtom = atom<NotepadDocument>(initialDocument);

export const toggleLineAtom = atom(
  null,
  (get, set, lineId: string) => {
    const current = get(documentAtom);
    const updated = documentService.toggleLine(current, lineId);
    set(documentAtom, updated);
    documentService.save(updated);
  }
);

export const updateLineTextAtom = atom(
  null,
  (get, set, { lineId, text }: { lineId: string; text: string }) => {
    const current = get(documentAtom);
    const updated = documentService.updateLineText(current, lineId, text);
    set(documentAtom, updated);
    documentService.save(updated);
  }
);

export const addLineAtom = atom(
  null,
  (get, set, text: string = "") => {
    const current = get(documentAtom);
    const updated = documentService.addLine(current, text);
    set(documentAtom, updated);
    documentService.save(updated);
  }
);

export const insertLineAfterAtom = atom(
  null,
  (get, set, afterLineId: string, text: string = "") => {
    const current = get(documentAtom);
    const updated = documentService.insertLineAfter(current, afterLineId, text);
    set(documentAtom, updated);
    documentService.save(updated);
    return updated;
  }
);

export const insertLineBeforeAtom = atom(
  null,
  (get, set, beforeLineId: string, text: string = "") => {
    const current = get(documentAtom);
    const updated = documentService.insertLineBefore(current, beforeLineId, text);
    set(documentAtom, updated);
    documentService.save(updated);
    return updated;
  }
);

export const splitLineAtom = atom(
  null,
  (get, set, lineId: string, splitAt: number) => {
    const current = get(documentAtom);
    const updated = documentService.splitLine(current, lineId, splitAt);
    set(documentAtom, updated);
    documentService.save(updated);
    return updated;
  }
);

export const deleteLineAtom = atom(
  null,
  (get, set, lineId: string) => {
    const current = get(documentAtom);
    const updated = documentService.deleteLine(current, lineId);
    set(documentAtom, updated);
    documentService.save(updated);
  }
);
