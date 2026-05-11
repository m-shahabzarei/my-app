import type { Note, RichNoteContent } from "@/types/note";

const NOTES_STORAGE_KEY = "my_app_notes_v1";

export interface NotesRepository {
  list: () => Note[];
  save: (notes: Note[]) => void;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function isRichNoteContent(value: unknown): value is RichNoteContent {
  return Boolean(value && typeof value === "object" && (value as { type?: unknown }).type === "doc");
}

export function createEmptyRichNoteContent(): RichNoteContent {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  };
}

export function createRichNoteContentFromText(content: string): RichNoteContent {
  const lines = content.split("\n");
  const blocks = lines.length > 0 ? lines : [""];

  return {
    type: "doc",
    content: blocks.map((line) => {
      const text = line.trimEnd();

      if (!text) {
        return {
          type: "paragraph",
        };
      }

      return {
        type: "paragraph",
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    }),
  };
}

export function getNoteRichContent(note: Note): RichNoteContent {
  return note.richContent ?? createRichNoteContentFromText(note.content);
}

function normalizeStoredNote(value: unknown): Note | null {
  if (!value || typeof value !== "object") return null;

  const note = value as Partial<Note>;
  if (typeof note.id !== "string") return null;

  const now = new Date().toISOString();
  const richContent = isRichNoteContent(note.richContent) ? note.richContent : undefined;

  return {
    id: note.id,
    title: typeof note.title === "string" ? note.title : "",
    content: typeof note.content === "string" ? note.content : "",
    richContent,
    createdAt: typeof note.createdAt === "string" ? note.createdAt : now,
    updatedAt: typeof note.updatedAt === "string" ? note.updatedAt : typeof note.createdAt === "string" ? note.createdAt : now,
  };
}

export function createBlankNote(): Note {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: "",
    content: "",
    richContent: createEmptyRichNoteContent(),
    createdAt: now,
    updatedAt: now,
  };
}

export function sortNotesByUpdatedDesc(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getNoteDisplayTitle(note: Note): string {
  return note.title.trim() || "Untitled note";
}

export function getNotePreview(note: Note): string {
  const preview = note.content.replace(/\s+/g, " ").trim();
  if (!preview) return "No content yet";
  return preview.length > 140 ? `${preview.slice(0, 140)}…` : preview;
}

export function formatNoteUpdatedAt(updatedAt: string): string {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "Updated recently";

  return `Updated ${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

export const localNotesRepository: NotesRepository = {
  list: () => {
    if (typeof window === "undefined") return [];

    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    const storedNotes = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { notes?: unknown }).notes)
        ? (parsed as { notes: unknown[] }).notes
        : [];

    return sortNotesByUpdatedDesc(storedNotes.map(normalizeStoredNote).filter((note): note is Note => Boolean(note)));
  },

  save: (notes) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sortNotesByUpdatedDesc(notes)));
  },
};

export const notesRepository = localNotesRepository;
