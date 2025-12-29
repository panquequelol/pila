export type TodoState = "TODO" | "DONE";

export type TodoLine = {
  id: string;
  text: string;
  state: TodoState;
};

export type NotepadDocument = TodoLine[];

export const STORAGE_KEY = "nairobi-notepad";
