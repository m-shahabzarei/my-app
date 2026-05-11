import { create } from "zustand";
import { createBlankNote, notesRepository, sortNotesByUpdatedDesc } from "@/lib/notes";
import type { Note, NoteUpdate } from "@/types/note";

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrate: () => void;
  createNote: () => Note | null;
  updateNote: (noteId: string, update: NoteUpdate) => boolean;
  deleteNote: (noteId: string) => boolean;
  selectNote: (noteId: string | null) => void;
}

const STORAGE_ERROR = "Your note could not be saved. Check browser storage and try again.";

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  hasHydrated: false,
  isLoading: false,
  error: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const { hasHydrated, isLoading } = get();
    if (hasHydrated || isLoading) return;

    set({ isLoading: true, error: null });

    try {
      set({ notes: notesRepository.list(), hasHydrated: true, isLoading: false });
    } catch {
      set({ hasHydrated: true, isLoading: false, error: "Your notes could not be loaded from browser storage." });
    }
  },

  createNote: () => {
    const note = createBlankNote();
    const nextNotes = sortNotesByUpdatedDesc([note, ...get().notes]);

    try {
      notesRepository.save(nextNotes);
      set({ notes: nextNotes, selectedNoteId: note.id, error: null });
      return note;
    } catch {
      set({ error: STORAGE_ERROR });
      return null;
    }
  },

  updateNote: (noteId, update) => {
    let didChange = false;
    const now = new Date().toISOString();
    const nextNotes = get().notes.map((note) => {
      if (note.id !== noteId) return note;

      const nextTitle = update.title ?? note.title;
      const nextContent = update.content ?? note.content;
      const nextRichContent = Object.prototype.hasOwnProperty.call(update, "richContent") ? update.richContent : note.richContent;
      if (nextTitle === note.title && nextContent === note.content && nextRichContent === note.richContent) return note;

      didChange = true;
      return {
        ...note,
        title: nextTitle,
        content: nextContent,
        richContent: nextRichContent,
        updatedAt: now,
      };
    });

    if (!didChange) return true;

    const sortedNotes = sortNotesByUpdatedDesc(nextNotes);

    try {
      notesRepository.save(sortedNotes);
      set({ notes: sortedNotes, error: null });
      return true;
    } catch {
      set({ error: STORAGE_ERROR });
      return false;
    }
  },

  deleteNote: (noteId) => {
    const nextNotes = get().notes.filter((note) => note.id !== noteId);

    try {
      notesRepository.save(nextNotes);
      set((state) => ({
        notes: nextNotes,
        selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
        error: null,
      }));
      return true;
    } catch {
      set({ error: STORAGE_ERROR });
      return false;
    }
  },

  selectNote: (noteId) => set({ selectedNoteId: noteId }),
}));
