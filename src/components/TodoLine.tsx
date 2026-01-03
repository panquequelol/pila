import type { TodoLine as TodoLineType } from "../orquestrator";
import type { Language } from "../orquestrator/types";
import { useSetAtom } from "jotai";
import { toggleLineAtom, updateLineTextAtom } from "../atoms";
import { useEffect, useRef, memo, useCallback } from "react";
import { getCursorOffset, setCursorOffset } from "../utils/cursor";
import { formatTimestamp } from "../utils/timestamp";
import { motion } from "motion/react";
import type { TFunction } from "i18next";

// Detect platform once at module load time
const IS_MAC = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

interface TodoLineProps {
  line: TodoLineType;
  index: number;
  totalLines: number;
  onNavigate: (index: number, direction: "up" | "down" | "left" | "right") => void;
  onDeleteAndNavigate: (currentIndex: number) => void;
  updatedAt: number;
  t: TFunction;
  language: Language;
  isEmptyDocument?: boolean;
  showPlaceholder?: boolean;
  isAfterLastTodo?: boolean;
}

// Escape HTML to prevent XSS - only allow @today keyword highlighting
const escapeHtml = (text: string): string => {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
};

const highlightText = (text: string): string => {
  const escaped = escapeHtml(text);
  return escaped.replace(/(@today)/gi, '<mark class="keyword-today">$1</mark>');
};

const saveCursorPosition = (element: HTMLElement): number | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
};

export const TodoLine = memo(({ line, index, totalLines, onNavigate, onDeleteAndNavigate, updatedAt, t, language, isEmptyDocument, showPlaceholder, isAfterLastTodo = false }: TodoLineProps) => {
  const toggleLine = useSetAtom(toggleLineAtom);
  const updateLineText = useSetAtom(updateLineTextAtom);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastTextRef = useRef<string>("");

  const isEmpty = !line.text.trim();

  const handleToggle = useCallback(() => {
    if (!isEmpty) {
      toggleLine(line.id);
    }
  }, [isEmpty, toggleLine, line.id]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    updateLineText({ lineId: line.id, text });
  }, [line.id, updateLineText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (e.key === "Backspace" && !line.text) {
      e.preventDefault();
      onDeleteAndNavigate(index);
      return;
    }

    const cursorOffset = getCursorOffset(editor);
    const textLength = line.text.length;

    // Arrow up at start of line -> go to previous line
    if (e.key === "ArrowUp" && cursorOffset === 0 && index > 0) {
      e.preventDefault();
      onNavigate(index, "up");
      return;
    }

    // Arrow down at end of line -> go to next line
    if (e.key === "ArrowDown" && cursorOffset >= textLength && index < totalLines - 1) {
      e.preventDefault();
      onNavigate(index, "down");
      return;
    }

    // Arrow left at start of line -> go to previous line
    if (e.key === "ArrowLeft" && cursorOffset === 0 && index > 0) {
      e.preventDefault();
      onNavigate(index, "left");
      return;
    }

    // Arrow right at end of line -> go to next line
    if (e.key === "ArrowRight" && cursorOffset >= textLength && index < totalLines - 1) {
      e.preventDefault();
      onNavigate(index, "right");
      return;
    }
  };

  // Update highlighting when text changes, preserving cursor
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Skip if text hasn't actually changed (except initial render)
    if (lastTextRef.current !== "" && line.text === lastTextRef.current) {
      return;
    }
    lastTextRef.current = line.text;

    const isFocused = document.activeElement === editor;
    const newHtml = highlightText(line.text);

    if (editor.innerHTML !== newHtml) {
      const cursorOffset = isFocused ? saveCursorPosition(editor) : null;
      editor.innerHTML = newHtml;
      if (cursorOffset !== null) {
        setCursorOffset(editor, cursorOffset);
      }
    }
  }, [line.text]);

  return (
    <div className={`todo-line ${isEmpty ? "todo-line--empty" : ""} ${isAfterLastTodo && isEmpty && !showPlaceholder ? "todo-line--trailing" : ""}`} data-state={line.state} data-empty-document={isEmptyDocument ? "true" : "false"}>
      {!isEmpty && (
        <motion.div
          className="todo-toggle"
          onClick={handleToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ strokeWidth: "var(--stroke-width)" }}>
            {/* Box */}
            <motion.rect
              x="2"
              y="2"
              width="16"
              height="16"
              rx="3"
              stroke="var(--color-text-done)"
              strokeWidth="var(--stroke-width)"
              initial={false}
              transition={{ duration: 0.3 }}
            />
            {/* Checkmark - animates in with scale */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: line.state === "DONE" ? 1 : 0,
                opacity: line.state === "DONE" ? 1 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 12,
                delay: line.state === "DONE" ? 0.05 : 0,
              }}
              style={{ transformOrigin: "10px 10px" }}
            >
              <path
                d="M6 10 L9 13 L14 7"
                stroke="var(--color-text-done)"
                strokeWidth="var(--stroke-width)"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </motion.g>
          </svg>
        </motion.div>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="todo-text"
        data-placeholder={isEmptyDocument ? "" : "..."}
        data-line-id={line.id}
      />
      {showPlaceholder && !line.text && (
        <div className="todo-placeholder">
          {t("emptyHint")} {IS_MAC ? "⌘ + p" : "ctrl + p"}
        </div>
      )}
      {!isEmpty && (
        <span className="todo-timestamp">{formatTimestamp(updatedAt, language)}</span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for fine-grained re-render control
  return (
    prevProps.line.id === nextProps.line.id &&
    prevProps.line.text === nextProps.line.text &&
    prevProps.line.state === nextProps.line.state &&
    prevProps.updatedAt === nextProps.updatedAt &&
    prevProps.language === nextProps.language &&
    prevProps.index === nextProps.index &&
    prevProps.totalLines === nextProps.totalLines &&
    prevProps.isEmptyDocument === nextProps.isEmptyDocument &&
    prevProps.showPlaceholder === nextProps.showPlaceholder &&
    prevProps.isAfterLastTodo === nextProps.isAfterLastTodo
  );
});
