import { atom } from "jotai";

export interface Command {
  id: string;
  text: string;
  onClick: () => void;
}

export const commandPaletteOpenAtom = atom(false);
export const commandsAtom = atom<Command[]>([]);
