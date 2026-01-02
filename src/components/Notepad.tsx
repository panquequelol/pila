import { useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { documentAtom, addLineAtom, deleteLineAtom } from "../atoms";
import { archiveSectionAtom, viewModeAtom } from "../atoms/archive";
import { settingsAtom } from "../atoms/settings";
import { TodoLine } from "./TodoLine";
import { ArchiveView } from "./ArchiveView";
import { setCursorOffset } from "../utils/cursor";
import { getSections, type Section } from "../orquestrator/sections";
import { documentService } from "../orquestrator/document";
import { useTranslations } from "../i18n/translations";

export const Notepad = () => {
  const [docs] = useAtom(documentAtom);
  const setDocument = useSetAtom(documentAtom);
  const [_, addLine] = useAtom(addLineAtom);
  const deleteLine = useSetAtom(deleteLineAtom);
  const archiveSection = useSetAtom(archiveSectionAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [settings] = useAtom(settingsAtom);
  const t = useTranslations(settings.language);
  const lastLineCountRef = useRef(0);
  const shouldFocusLastRef = useRef(false);
  const pendingFocusRef = useRef<{ lineId: string | null; offset: number }>({ lineId: null, offset: 0 });
  const prevSectionsRef = useRef<Section[]>([]);
  const archivingSectionRef = useRef<{ startIndex: number; endIndex: number } | null>(null);
  const hasAutoFocusedRef = useRef(false);

  // Check if document is effectively empty (no visible todos)
  const hasVisibleTodos = docs.some((line) => line.text.trim());

  // Auto-focus first empty line on mount
  useEffect(() => {
    if (hasAutoFocusedRef.current) return;
    const emptyLine = docs.find((line) => !line.text.trim());
    if (emptyLine) {
      const element = document.querySelector(`[data-line-id="${emptyLine.id}"]`) as HTMLElement;
      element?.focus();
      hasAutoFocusedRef.current = true;
    }
  }, [docs]);

  // Ctrl+P handler for toggling view mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "p" || e.key === "P") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setViewMode((m) => (m === "active" ? "archive" : "active"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setViewMode]);

  // Ensure document has at least one line (but don't interfere with archiving focus)
  useEffect(() => {
    if (docs.length === 0 && !shouldFocusLastRef.current) {
      addLine("");
    }
  }, [docs.length, addLine]);

  // Focus the last line when a new line is added
  useEffect(() => {
    if (!shouldFocusLastRef.current) return;
    if (docs.length <= lastLineCountRef.current) {
      lastLineCountRef.current = docs.length;
      return;
    }

    shouldFocusLastRef.current = false;
    const lastLine = docs[docs.length - 1];
    if (lastLine) {
      // Double RAF ensures React has committed the DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const lastInput = document.querySelector(`[data-line-id="${lastLine.id}"]`) as HTMLElement;
          lastInput?.focus();
        });
      });
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

  // Check for completed sections and trigger archive
  useEffect(() => {
    if (archivingSectionRef.current) return;

    const currentSections = getSections(docs);

    const newlyComplete = currentSections.filter((section) => {
      const prevSection = prevSectionsRef.current.find(
        (s) => s.startIndex === section.startIndex && s.endIndex === section.endIndex
      );
      return section.isComplete && prevSection && !prevSection.isComplete;
    });

    if (newlyComplete.length > 0) {
      const section = newlyComplete[0];
      // Mark section for archiving - AnimatePresence will handle exit animation
      archivingSectionRef.current = { startIndex: section.startIndex, endIndex: section.endIndex };
      // After exit animation, actually archive
      setTimeout(() => {
        if (archivingSectionRef.current) {
          // Capture indices before clearing the ref
          const archivedStartIndex = archivingSectionRef.current.startIndex;
          const archivedEndIndex = archivingSectionRef.current.endIndex;

          archiveSection({
            startIndex: archivedStartIndex,
            endIndex: archivedEndIndex,
          });
          archivingSectionRef.current = null;

          // Use zero-delay timeout to process after React has handled the archiveSection update
          setTimeout(() => {
            const currentDoc = documentService.load();

            // After archiving, the document shrinks by (endIndex - startIndex) lines
            // The line that was at endIndex is now at startIndex position
            // We need to remove the empty line at this new position
            const emptyLineIndex = archivedStartIndex;
            if (emptyLineIndex < currentDoc.length) {
              const lineAfterArchived = currentDoc[emptyLineIndex];
              if (lineAfterArchived && !lineAfterArchived.text.trim()) {
                // Remove only this specific empty line
                const cleaned = [
                  ...currentDoc.slice(0, emptyLineIndex),
                  ...currentDoc.slice(emptyLineIndex + 1),
                ];
                documentService.save(cleaned);
                setDocument(cleaned);

                // Set up the refs for focus - must happen BEFORE addLine
                lastLineCountRef.current = cleaned.length;
                shouldFocusLastRef.current = true;

                // Add the new line - this will trigger the focus useEffect
                addLine("");
                return;
              }
            }

            // No empty line to remove, just update refs and add new line
            lastLineCountRef.current = currentDoc.length;
            shouldFocusLastRef.current = true;
            addLine("");
          }, 0);
        }
      }, 300);
      return;
    }

    prevSectionsRef.current = currentSections;
  }, [docs, archiveSection]);

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
        const textLength = targetLine.text.length;
        setCursorOffset(targetElement, isGoingUp ? textLength : 0);
      }
    }
  };

  const handleDeleteAndNavigate = (currentIndex: number) => {
    const lineToDelete = docs[currentIndex];
    if (!lineToDelete) return;

    const targetIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    const targetLine = targetIndex < docs.length ? docs[targetIndex] : null;

    deleteLine(lineToDelete.id);

    if (targetLine) {
      const targetText = targetLine.text;
      pendingFocusRef.current = {
        lineId: targetLine.id,
        offset: targetText.length,
      };
    }
  };

  if (viewMode === "archive") {
    return <ArchiveView />;
  }

  // Check if a line is in the archiving section
  const isArchiving = (index: number) => {
    if (!archivingSectionRef.current) return false;
    const { startIndex, endIndex } = archivingSectionRef.current;
    return index >= startIndex && index < endIndex;
  };

  return (
    <div className="notepad" onKeyDown={handleKeyDown}>
      <div className="todo-lines">
        <AnimatePresence mode="popLayout">
          {docs.map((line, index) => {
            if (isArchiving(index)) return null;
            return (
              <motion.div
                key={line.id}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TodoLine
                  line={line}
                  index={index}
                  totalLines={docs.length}
                  onNavigate={handleNavigate}
                  onDeleteAndNavigate={handleDeleteAndNavigate}
                  updatedAt={line.updatedAt}
                  translations={t}
                  isEmptyDocument={!hasVisibleTodos}
                  showPlaceholder={!hasVisibleTodos && index === 0}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
