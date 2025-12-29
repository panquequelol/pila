import { useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import { documentAtom, addLineAtom, deleteLineAtom } from "../atoms";
import { TodoLine } from "./TodoLine";
import { setCursorOffset } from "../utils/cursor";

export const Notepad = () => {
  const [docs] = useAtom(documentAtom);
  const addLine = useSetAtom(addLineAtom);
  const deleteLine = useSetAtom(deleteLineAtom);
  const lastLineCountRef = useRef(0);
  const shouldFocusLastRef = useRef(false);
  const pendingFocusRef = useRef<{ lineId: string | null; offset: number }>({ lineId: null, offset: 0 });

  useEffect(() => {
    if (docs.length === 0) {
      addLine("");
    }
  }, [docs.length, addLine]);

  // Focus the last line when a new line is added
  useEffect(() => {
    if (shouldFocusLastRef.current && docs.length > lastLineCountRef.current) {
      const lastLine = docs[docs.length - 1];
      if (lastLine) {
        const lastInput = document.querySelector(`[data-line-id="${lastLine.id}"]`) as HTMLElement;
        lastInput?.focus();
      }
      shouldFocusLastRef.current = false;
    }
    lastLineCountRef.current = docs.length;
  }, [docs.length]);

  // Handle pending focus after deletion (runs after re-render)
  useEffect(() => {
    if (pendingFocusRef.current.lineId) {
      const element = document.querySelector(
        `[data-line-id="${pendingFocusRef.current.lineId}"]`
      ) as HTMLDivElement;

      if (element) {
        element.focus();
        setCursorOffset(element, pendingFocusRef.current.offset);
        pendingFocusRef.current = { lineId: null, offset: 0 };
      }
    }
  }, [docs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      lastLineCountRef.current = docs.length;
      shouldFocusLastRef.current = true;
      addLine();
    }
  };

  const handleNavigate = (fromIndex: number, direction: "up" | "down" | "left" | "right") => {
    const isGoingUp = direction === "up" || direction === "left";
    const targetIndex = isGoingUp ? fromIndex - 1 : fromIndex + 1;

    if (targetIndex >= 0 && targetIndex < docs.length) {
      const targetLine = docs[targetIndex];
      const targetElement = document.querySelector(
        `[data-line-id="${targetLine.id}"]`
      ) as HTMLDivElement;

      if (targetElement) {
        targetElement.focus();
        // Move cursor to end when going up/left, to start when going down/right
        const textLength = targetLine.text.length;
        setCursorOffset(targetElement, isGoingUp ? textLength : 0);
      }
    }
  };

  const handleDeleteAndNavigate = (currentIndex: number) => {
    const lineToDelete = docs[currentIndex];
    if (!lineToDelete) return;

    // Determine which line to focus after deletion
    const targetIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    const targetLine = targetIndex < docs.length ? docs[targetIndex] : null;

    // Delete the line
    deleteLine(lineToDelete.id);

    // Set pending focus for the next render
    if (targetLine) {
      const targetText = targetLine.text;
      pendingFocusRef.current = {
        lineId: targetLine.id,
        offset: targetText.length,
      };
    }
  };

  return (
    <div className="notepad" onKeyDown={handleKeyDown}>
      <div className="todo-lines">
        {docs.map((line, index) => (
          <TodoLine
            key={line.id}
            line={line}
            index={index}
            totalLines={docs.length}
            onNavigate={handleNavigate}
            onDeleteAndNavigate={handleDeleteAndNavigate}
          />
        ))}
      </div>
    </div>
  );
};
