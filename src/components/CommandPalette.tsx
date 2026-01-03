import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { commandPaletteOpenAtom, commandsAtom, type Command } from "../atoms/commandPalette";
import { useTranslation } from "react-i18next";
import { Modal } from "@mui/base/Modal";
import { AnimatePresence, motion } from "motion/react";

export const CommandPalette = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useAtom(commandPaletteOpenAtom);
  const [commands] = useAtom(commandsAtom);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const filteredCommandsRef = useRef<typeof commands>([]);

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;
    const query = searchQuery.toLowerCase();
    return commands.filter((cmd) =>
      cmd.text.toLowerCase().includes(query)
    );
  }, [commands, searchQuery]);

  // Keep ref in sync for stale closure protection
  useEffect(() => {
    filteredCommandsRef.current = filteredCommands;
  }, [filteredCommands]);

  // Reset selected index when filtered commands change or when palette opens
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands, isOpen]);

  // Focus input synchronously when opened, reset state when closed
  const inputRefCallback = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (node && isOpen) {
      node.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentFiltered = filteredCommandsRef.current;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) =>
        i < currentFiltered.length - 1 ? i + 1 : i
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const boundedIndex = Math.min(selectedIndex, currentFiltered.length - 1);
      const command = currentFiltered[boundedIndex];
      if (command) {
        command.onClick();
        setIsOpen(false);
        setSearchQuery("");
      }
    }
  }, [selectedIndex, setIsOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex < filteredCommands.length) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, filteredCommands.length]);

  const handleClose = useCallback((_event: {}, _reason: 'backdropClick' | 'escapeKeyDown') => {
    setIsOpen(false);
    setSearchQuery("");
  }, [setIsOpen]);

  const handleCommandClick = useCallback((command: Command) => {
    command.onClick();
    setIsOpen(false);
    setSearchQuery("");
  }, [setIsOpen]);

  const handleMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          open={isOpen}
          onClose={handleClose}
          disableAutoFocus={true}
          hideBackdrop={true}
          slots={{
            root: "div",
          }}
          slotProps={{
            root: {
              className: "fixed inset-0 flex items-start justify-center pt-[20vh] z-[1001]",
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="w-full max-w-md mx-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-palette-label"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "var(--stroke-width) solid var(--color-archive-border)",
              borderRadius: "8px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
        {/* Input */}
        <input
          ref={inputRefCallback}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("commandPlaceholder")}
          aria-label="Search commands"
          aria-autocomplete="list"
          aria-controls="command-list"
          aria-expanded="true"
          role="combobox"
          id="command-palette-label"
          className="w-full px-4 py-3 bg-transparent outline-none"
          style={{
            color: "var(--color-text)",
            fontSize: "var(--base-font-size)",
            fontFamily: "inherit",
            borderBottom: "1px solid var(--color-archive-border)",
          }}
        />

        {/* Command List */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Search results"
          id="command-list"
          className="max-h-[60vh] overflow-y-auto overflow-x-hidden"
        >
          {filteredCommands.length === 0 ? (
            <div
              className="px-4 py-8 text-center"
              style={{ color: "var(--color-text-placeholder)" }}
            >
              {t("noCommandsFound")}
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                onClick={() => handleCommandClick(command)}
                onMouseEnter={() => handleMouseEnter(index)}
                aria-selected={index === selectedIndex}
                role="option"
                className="w-full text-left px-4 py-3 outline-none cursor-pointer"
                style={{
                  color: "var(--color-text)",
                  fontSize: "var(--base-font-size)",
                  fontFamily: "inherit",
                  textTransform: "lowercase",
                  backgroundColor:
                    index === selectedIndex
                      ? "var(--color-bg-2)"
                      : "transparent",
                  borderBottom:
                    index < filteredCommands.length - 1
                      ? "1px solid var(--color-archive-border)"
                      : "none",
                }}
              >
                {command.text}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        {filteredCommands.length > 0 && (
          <div
            className="px-4 py-2 text-xs flex gap-4"
            style={{
              color: "var(--color-text-placeholder)",
              borderTop: "1px solid var(--color-archive-border)",
            }}
          >
            <span>{t("navigateHint")}</span>
            <span>{t("selectHint")}</span>
          </div>
        )}
      </motion.div>
    </Modal>
      )}
    </AnimatePresence>
  );
};
