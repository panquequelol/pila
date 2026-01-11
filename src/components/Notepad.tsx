import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { motion, AnimatePresence } from "motion/react";
import { documentAtom, addLineAtom, deleteLineAtom, insertLineAfterAtom, insertLineBeforeAtom, splitLineAtom, moveLineUpAtom, moveLineDownAtom } from "../atoms";
import { archiveSectionAtom, viewModeAtom } from "../atoms/archive";
import { settingsAtom, setDarkModeAtom } from "../atoms/settings";
import { TodoLine } from "./TodoLine";
import { ArchiveView } from "./ArchiveView";
import { CommandPalette } from "./CommandPalette";
import { commandPaletteOpenAtom, commandsAtom, type Command } from "../atoms/commandPalette";
import { getCursorOffset, setCursorOffset } from "../utils/cursor";
import { isPhone } from "../utils/device";
import { getSections, type Section } from "../orquestrator/sections";
import { documentService } from "../orquestrator/document";
import { useTranslation } from "react-i18next";
import { storage } from "../orquestrator/storage";

export const Notepad = () => {
  const [docs] = useAtom(documentAtom);
  const setDocument = useSetAtom(documentAtom);
  const addLine = useSetAtom(addLineAtom);
  const insertLineAfter = useSetAtom(insertLineAfterAtom);
  const insertLineBefore = useSetAtom(insertLineBeforeAtom);
  const splitLine = useSetAtom(splitLineAtom);
  const deleteLine = useSetAtom(deleteLineAtom);
  const moveLineUp = useSetAtom(moveLineUpAtom);
  const moveLineDown = useSetAtom(moveLineDownAtom);
  const archiveSection = useSetAtom(archiveSectionAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [settings] = useAtom(settingsAtom);
  const setCommandPaletteOpen = useSetAtom(commandPaletteOpenAtom);
  const setDarkMode = useSetAtom(setDarkModeAtom);
  const setCommands = useSetAtom(commandsAtom);
  const { t } = useTranslation();
  const lastLineCountRef = useRef(0);
  const shouldFocusLastRef = useRef(false);
  const pendingFocusRef = useRef<{ lineId: string | null; offset: number }>({ lineId: null, offset: 0 });
  const newLineToFocusRef = useRef<string | null>(null);
  const prevSectionsRef = useRef<Section[]>([]);
  const hasAutoFocusedRef = useRef(false);
  const [isPhoneDevice, setIsPhoneDevice] = useState(false);
  const onAnimationCompleteRef = useRef<(() => void) | null>(null);
  const [archivingSection, setArchivingSection] = useState<{ startIndex: number; endIndex: number } | null>(null);
  const isTrimmingRef = useRef(false);

  // Ref for docs that doesn't cause re-renders when accessed
  const docsRef = useRef(docs);
  useEffect(() => { docsRef.current = docs; }, [docs]);

  // Detect phone device on mount and when window resizes (debounced)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const checkPhone = () => setIsPhoneDevice(isPhone());
    const debouncedCheckPhone = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkPhone, 150);
    };
    checkPhone();
    window.addEventListener("resize", debouncedCheckPhone);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedCheckPhone);
    };
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

  // Cmd+, handler for toggling view mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "," && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        setViewMode((m) => (m === "active" ? "archive" : "active"));
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as EventListenerOptions);
  }, [setViewMode]);

  // Register command palette commands
  useEffect(() => {
    const commands: Command[] = [
      {
        id: "toggle-theme",
        text: t("toggleTheme"),
        onClick: () => setDarkMode(settings.darkMode === "dark" ? "light" : "dark"),
      },
      {
        id: "trim-noise",
        text: t("trimNoise"),
        onClick: () => {
          const currentDocs = docsRef.current;

          // Find first non-empty line index
          let firstNonEmpty = -1;
          for (let i = 0; i < currentDocs.length; i++) {
            if (currentDocs[i].text.trim()) {
              firstNonEmpty = i;
              break;
            }
          }
          // Find last non-empty line index
          let lastNonEmpty = -1;
          for (let i = currentDocs.length - 1; i >= 0; i--) {
            if (currentDocs[i].text.trim()) {
              lastNonEmpty = i;
              break;
            }
          }

          // If no non-empty lines found, keep only one empty line at top
          if (firstNonEmpty === -1) {
            isTrimmingRef.current = true;
            const newId = crypto.randomUUID();
            const singleEmpty = [{
              id: newId,
              text: "",
              state: "TODO" as const,
              updatedAt: Date.now(),
            }];
            storage.setSync(singleEmpty);
            setDocument(singleEmpty);

            // Focus the new empty line after React renders
            setTimeout(() => {
              const element = document.querySelector(`[data-line-id="${newId}"]`) as HTMLElement;
              element?.focus();
              isTrimmingRef.current = false;
            }, 0);
            return;
          }

          // Trim from first to last non-empty and collapse multiple empty lines to single empty line
          if (firstNonEmpty > 0 || lastNonEmpty < currentDocs.length - 1) {
            const trimmed = currentDocs.slice(firstNonEmpty, lastNonEmpty + 1);
            // Collapse consecutive empty lines to single empty line
            const collapsed: typeof trimmed = [];
            let lastWasEmpty = true; // Start with true to skip leading empty lines
            for (const line of trimmed) {
              const isEmpty = !line.text.trim();
              if (isEmpty) {
                if (!lastWasEmpty) {
                  // Only add empty line if previous line wasn't empty
                  collapsed.push(line);
                }
                lastWasEmpty = true;
              } else {
                collapsed.push(line);
                lastWasEmpty = false;
              }
            }
            storage.setSync(collapsed);
            setDocument(collapsed);
          }
        },
      },
      {
        id: "toggle-view",
        text: viewMode === "active" ? t("openSettings") : t("openTodos"),
        onClick: () => setViewMode((m) => (m === "active" ? "archive" : "active")),
      },
    ];
    setCommands(commands);
  }, [viewMode, settings, setDarkMode, setCommands, setDocument, setViewMode, t]);

  // Cmd+P handler for toggling command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "p" || e.key === "P") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        setCommandPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true } as EventListenerOptions);
  }, [setCommandPaletteOpen]);

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
  }, [viewMode, addLine, docsRef]);

  // Ensure document has at least one line (but don't interfere with archiving focus or trimming)
  useEffect(() => {
    if (docs.length === 0 && !shouldFocusLastRef.current && !isTrimmingRef.current) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Only care about length changes, not individual doc changes
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
    if (archivingSection !== null) return;

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

      // Mark section for archiving (triggers exit animation)
      setArchivingSection({ startIndex: archivedStartIndex, endIndex: archivedEndIndex });

      // Perform the actual archiving after animation completes
      // Using setTimeout to match animation duration (300ms)
      const timeoutId = setTimeout(() => {
        // Actually archive the section
        archiveSection({
          startIndex: archivedStartIndex,
          endIndex: archivedEndIndex,
        });
        setArchivingSection(null);
        onAnimationCompleteRef.current = null;

        // Cleanup: remove empty line and add new one
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
      }, 350); // Slightly longer than animation duration (300ms)

      // Store timeout ID for cleanup if component unmounts
      onAnimationCompleteRef.current = () => clearTimeout(timeoutId);

      return () => clearTimeout(timeoutId);
    }

    prevSectionsRef.current = currentSections;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- archivingSection intentionally omitted to prevent timeout from being cleared when state changes
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

  const movedLineIdRef = useRef<string | null>(null);

  const handleMoveLine = useCallback((lineId: string, direction: "up" | "down") => {
    const currentIndex = docs.findIndex((line) => line.id === lineId);
    if (currentIndex === -1) return;

    // Check bounds
    if (direction === "up" && currentIndex <= 0) return;
    if (direction === "down" && currentIndex >= docs.length - 1) return;

    // Move the line
    if (direction === "up") {
      moveLineUp(lineId);
    } else {
      moveLineDown(lineId);
    }

    // Focus the moved line after the re-render
    movedLineIdRef.current = lineId;
  }, [docs, moveLineUp, moveLineDown]);

  // Focus the moved line after re-render
  useEffect(() => {
    if (movedLineIdRef.current) {
      const lineIdToFocus = movedLineIdRef.current;
      movedLineIdRef.current = null;
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(
          `[data-line-id="${lineIdToFocus}"]`
        ) as HTMLElement;
        if (element) {
          element.focus();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [docs]);

  // Toggle view mode handler
  const handleToggleViewMode = useCallback(() => {
    setViewMode((m) => (m === "active" ? "archive" : "active"));
  }, [setViewMode]);

  return (
    <div className="w-full" onKeyDown={handleKeyDown}>
      <CommandPalette />
      {viewMode === "archive" ? (
        <ArchiveView />
      ) : (
        <>
          <div className="flex flex-col gap-0 group">
            <AnimatePresence>
              {docs.map((line, index) => {
                const isBeingArchived = archivingSection !== null &&
                  index >= archivingSection.startIndex &&
                  index < archivingSection.endIndex;

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
                        onMoveLine={handleMoveLine}
                        updatedAt={line.updatedAt}
                        t={t}
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
                      onMoveLine={handleMoveLine}
                      updatedAt={line.updatedAt}
                      t={t}
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
              className="fixed bottom-4 left-1/2 -translate-x-1/2 border rounded text-center z-[1000] px-2 py-2 cursor-pointer transition-all duration-200"
              style={{
                borderColor: "var(--color-archive-border)",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
                fontSize: "var(--base-font-size)",
                fontFamily: "inherit",
                textTransform: "lowercase",
              }}
              whileHover={{ backgroundColor: "var(--color-archive-border)" }}
              onClick={handleToggleViewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t("settingsHere")}
            </motion.button>
          )}
        </>
      )}
    </div>
  );
};
