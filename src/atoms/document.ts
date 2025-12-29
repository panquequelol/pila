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

export const deleteLineAtom = atom(
  null,
  (get, set, lineId: string) => {
    const current = get(documentAtom);
    const updated = documentService.deleteLine(current, lineId);
    set(documentAtom, updated);
    documentService.save(updated);
  }
);
