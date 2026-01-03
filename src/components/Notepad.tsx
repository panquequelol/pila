import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { motion, AnimatePresence } from "motion/react";
import { documentAtom, addLineAtom, deleteLineAtom, insertLineAfterAtom, insertLineBeforeAtom, splitLineAtom } from "../atoms";
import { archiveSectionAtom, viewModeAtom } from "../atoms/archive";
import { settingsAtom } from "../atoms/settings";
import { TodoLine } from "./TodoLine";
import { ArchiveView } from "./ArchiveView";
import { getCursorOffset, setCursorOffset } from "../utils/cursor";
import { isPhone } from "../utils/device";
import { getSections, type Section } from "../orquestrator/sections";
import { documentService } from "../orquestrator/document";
import { useTranslations } from "../i18n/translations";
import { storage } from "../orquestrator/storage";

export const Notepad = () => {
  const [docs] = useAtom(documentAtom);
  const setDocument = useSetAtom(documentAtom);
  const [_, addLine] = useAtom(addLineAtom);
  const [__, insertLineAfter] = useAtom(insertLineAfterAtom);
  const [___, insertLineBefore] = useAtom(insertLineBeforeAtom);
  const [____, splitLine] = useAtom(splitLineAtom);
  const deleteLine = useSetAtom(deleteLineAtom);
  const archiveSection = useSetAtom(archiveSectionAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [settings] = useAtom(settingsAtom);
  const t = useTranslations(settings.language);
  const lastLineCountRef = useRef(0);
  const shouldFocusLastRef = useRef(false);
  const pendingFocusRef = useRef<{ lineId: string | null; offset: number }>({ lineId: null, offset: 0 });
  const newLineToFocusRef = useRef<string | null>(null);
  const prevSectionsRef = useRef<Section[]>([]);
  const archivingSectionRef = useRef<{ startIndex: number; endIndex: number } | null>(null);
  const hasAutoFocusedRef = useRef(false);
  const [isPhoneDevice, setIsPhoneDevice] = useState(false);
  const [, forceUpdate] = useState({}); // Used to force re-render when archiving starts

  // Ref for docs that doesn't cause re-renders when accessed
  const docsRef = useRef(docs);
  useEffect(() => { docsRef.current = docs; }, [docs]);

  // Detect phone device on mount and when window resizes
  useEffect(() => {
    const checkPhone = () => setIsPhoneDevice(isPhone());
    checkPhone();
    window.addEventListener("resize", checkPhone);
    return () => window.removeEventListener("resize", checkPhone);
  }, []);

  // Memoize expensive computations
  const hasVisibleTodos = useMemo(() => docs.some((line) => line.text.trim()), [docs]);

  // Find the index of the last non-empty line (for showing indicators on trailing empty lines)
  const actualLastNonEmptyIndex = useMemo(() => {
    for (let i = docs.length - 1; i >= 0; i--) {
      if (docs[i].text.trim()) return i;
    }
    return -1;
  }, [docs]);

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

  // Ctrl+P handler for toggling view mode (use capture to prevent browser default)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "p" || e.key === "P") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        setViewMode((m) => (m === "active" ? "archive" : "active"));
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  }, []); // setViewMode from jotai is stable, no need for dependency

  // "/" handler for focusing the last empty line
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already in a contentEditable or input
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.getAttribute("contenteditable") === "true" ||
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT")
      ) {
        return;
      }

      if (e.key === "/" && viewMode === "active") {
        e.preventDefault();
        // Use ref to avoid depending on docs array
        const currentDocs = docsRef.current;
        // Find the last empty line
        const lastEmptyLine = [...currentDocs].reverse().find((line) => !line.text.trim());

        if (lastEmptyLine) {
          const element = document.querySelector(`[data-line-id="${lastEmptyLine.id}"]`) as HTMLElement;
          element?.focus();
        } else {
          // No empty line, create one and focus it
          lastLineCountRef.current = currentDocs.length;
          shouldFocusLastRef.current = true;
          addLine("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, addLine]);

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
      // Use setTimeout to wait for React's commit phase
      const timeoutId = setTimeout(() => {
        const lastInput = document.querySelector(`[data-line-id="${lastLine.id}"]`) as HTMLElement;
        lastInput?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
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

  // Focus the newly created line after Enter is pressed
  useEffect(() => {
    if (newLineToFocusRef.current) {
      const lineIdToFocus = newLineToFocusRef.current;
      newLineToFocusRef.current = null;
      // Use setTimeout to wait for React's commit phase
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(
          `[data-line-id="${lineIdToFocus}"]`
        ) as HTMLElement;
        if (element) {
          element.focus();
          setCursorOffset(element, 0);
        }
      }, 0);
      return () => clearTimeout(timeoutId);
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
      const { startIndex: archivedStartIndex, endIndex: archivedEndIndex } = section;

      // Mark section for archiving
      archivingSectionRef.current = { startIndex: archivedStartIndex, endIndex: archivedEndIndex };

      // Force re-render to show exit animation
      forceUpdate({});

      // Wait for animation to complete, then archive
      // Use double RAF to ensure React has committed and animation has started
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (!archivingSectionRef.current) return;

            // Actually archive the section
            archiveSection({
              startIndex: archivedStartIndex,
              endIndex: archivedEndIndex,
            });
            archivingSectionRef.current = null;

            // Cleanup: remove empty line and add new one
            setTimeout(() => {
              const currentDoc = documentService.load();
              const emptyLineIndex = archivedStartIndex;

              if (emptyLineIndex < currentDoc.length) {
                const lineAfterArchived = currentDoc[emptyLineIndex];
                if (lineAfterArchived && !lineAfterArchived.text.trim()) {
                  const cleaned = [
                    ...currentDoc.slice(0, emptyLineIndex),
                    ...currentDoc.slice(emptyLineIndex + 1),
                  ];
                  storage.setSync(cleaned);
                  setDocument(cleaned);
                }
              }

              const finalDoc = documentService.load();
              lastLineCountRef.current = finalDoc.length;
              shouldFocusLastRef.current = true;
              addLine("");
            }, 0);
          }, 350); // Slightly longer than animation duration (300ms)
        });
      });
    }

    prevSectionsRef.current = currentSections;
  }, [docs, archiveSection, setDocument, addLine]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const activeElement = document.activeElement as HTMLElement;
      const focusedLineId = activeElement?.getAttribute("data-line-id");

      if (!focusedLineId) {
        // Fallback: no line is focused, add at the end
        lastLineCountRef.current = docs.length;
        shouldFocusLastRef.current = true;
        addLine();
        return;
      }

      const focusedLine = docs.find((line) => line.id === focusedLineId);
      if (!focusedLine) return;

      // Get cursor position within the text
      const cursorOffset = getCursorOffset(activeElement);
      const textLength = focusedLine.text.length;

      if (textLength === 0) {
        // Empty line: insert new line below
        const updated = insertLineAfter(focusedLineId, "");
        const focusedIndex = docs.findIndex((l) => l.id === focusedLineId);
        if (focusedIndex !== -1 && updated[focusedIndex + 1]) {
          newLineToFocusRef.current = updated[focusedIndex + 1].id;
        }
      } else if (cursorOffset === 0) {
        // At start of non-empty line: insert new line above but stay on current line
        insertLineBefore(focusedLineId, "");
        newLineToFocusRef.current = null; // Don't move focus, stay on current line
      } else if (cursorOffset < textLength) {
        // In middle: split the line
        const updated = splitLine(focusedLineId, cursorOffset);
        const focusedIndex = docs.findIndex((l) => l.id === focusedLineId);
        if (focusedIndex !== -1 && updated[focusedIndex + 1]) {
          newLineToFocusRef.current = updated[focusedIndex + 1].id;
        }
      } else {
        // At end: insert new line below
        const updated = insertLineAfter(focusedLineId, "");
        const focusedIndex = docs.findIndex((l) => l.id === focusedLineId);
        if (focusedIndex !== -1 && updated[focusedIndex + 1]) {
          newLineToFocusRef.current = updated[focusedIndex + 1].id;
        }
      }
    }
  }, [docs, insertLineAfter, insertLineBefore, splitLine, addLine]);

  const handleNavigate = useCallback((fromIndex: number, direction: "up" | "down" | "left" | "right") => {
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
  }, [docs]);

  const handleDeleteAndNavigate = useCallback((currentIndex: number) => {
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
  }, [docs, deleteLine]);

  // Toggle view mode handler
  const handleToggleViewMode = useCallback(() => {
    setViewMode((m) => (m === "active" ? "archive" : "active"));
  }, [setViewMode]);

  return (
    <div className="notepad" onKeyDown={handleKeyDown}>
      {viewMode === "archive" ? (
        <ArchiveView />
      ) : (
        <>
          <div className="todo-lines">
            <AnimatePresence>
              {docs.map((line, index) => {
                const isBeingArchived = archivingSectionRef.current &&
                  index >= archivingSectionRef.current.startIndex &&
                  index < archivingSectionRef.current.endIndex;

                if (isBeingArchived) {
                  return (
                    <motion.div
                      key={line.id}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <TodoLine
                        line={line}
                        index={index}
                        totalLines={docs.length}
                        onNavigate={handleNavigate}
                        onDeleteAndNavigate={handleDeleteAndNavigate}
                        updatedAt={line.updatedAt}
                        translations={t}
                        language={settings.language}
                        isEmptyDocument={!hasVisibleTodos}
                        showPlaceholder={!hasVisibleTodos && index === 0}
                        isAfterLastTodo={index > actualLastNonEmptyIndex}
                      />
                    </motion.div>
                  );
                }

                return (
                  <div key={line.id}>
                    <TodoLine
                      line={line}
                      index={index}
                      totalLines={docs.length}
                      onNavigate={handleNavigate}
                      onDeleteAndNavigate={handleDeleteAndNavigate}
                      updatedAt={line.updatedAt}
                      translations={t}
                      language={settings.language}
                      isEmptyDocument={!hasVisibleTodos}
                      showPlaceholder={!hasVisibleTodos && index === 0}
                      isAfterLastTodo={index > actualLastNonEmptyIndex}
                    />
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
          {isPhoneDevice && (
            <motion.button
              className="settings-phone-btn"
              onClick={handleToggleViewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t.settingsHere}
            </motion.button>
          )}
        </>
      )}
    </div>
  );
};
