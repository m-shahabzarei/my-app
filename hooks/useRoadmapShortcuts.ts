"use client";

import { useEffect, type RefObject } from "react";

interface UseRoadmapShortcutsOptions {
  searchInputRef: RefObject<HTMLInputElement | null>;
  selectedNodeIds: string[];
  addNode: () => void;
  addChildNode: () => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export function useRoadmapShortcuts({
  searchInputRef,
  selectedNodeIds,
  addNode,
  addChildNode,
  deleteSelected,
  undo,
  redo,
}: UseRoadmapShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifierPressed = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (modifierPressed && key === "f") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (modifierPressed && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isEditableTarget(event.target)) return;

      if (key === "delete" || key === "backspace") {
        event.preventDefault();
        deleteSelected();
        return;
      }

      if (key === "n") {
        event.preventDefault();
        addNode();
        return;
      }

      if (key === "c" && selectedNodeIds.length === 1) {
        event.preventDefault();
        addChildNode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addChildNode, addNode, deleteSelected, redo, searchInputRef, selectedNodeIds.length, undo]);
}
