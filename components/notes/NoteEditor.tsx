"use client";

import { ArrowLeft, CheckCircle2, FileText, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import NoteRichTextEditor from "@/components/notes/editor/NoteRichTextEditor";
import { formatNoteUpdatedAt, getNoteDisplayTitle, getNoteRichContent } from "@/lib/notes";
import { useNotesStore } from "@/store/notes-store";
import type { Note, RichNoteContent } from "@/types/note";

interface NoteEditorProps {
  noteId: string;
}

type SaveState = "saved" | "saving" | "error";

type NoteDraft = {
  title: string;
  content: string;
  richContent: RichNoteContent;
  richContentSignature: string;
};

function serializeRichContent(richContent: RichNoteContent): string {
  return JSON.stringify(richContent);
}

function createDraft(title: string, content: string, richContent: RichNoteContent): NoteDraft {
  return {
    title,
    content,
    richContent,
    richContentSignature: serializeRichContent(richContent),
  };
}

function createDraftFromNote(note: Note): NoteDraft {
  return createDraft(note.title, note.content, getNoteRichContent(note));
}

function areDraftsEqual(first: NoteDraft, second: NoteDraft): boolean {
  return first.title === second.title && first.content === second.content && first.richContentSignature === second.richContentSignature;
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Saving
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200">
        Not saved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      Saved
    </span>
  );
}

function NoteEditorForm({ note }: { note: Note }) {
  const router = useRouter();
  const error = useNotesStore((state) => state.error);
  const updateNote = useNotesStore((state) => state.updateNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const [initialDraft] = useState(() => createDraftFromNote(note));
  const [title, setTitle] = useState(initialDraft.title);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const draftRef = useRef<NoteDraft>(initialDraft);
  const lastSavedRef = useRef<NoteDraft>(initialDraft);
  const saveTimeoutRef = useRef<number | null>(null);
  const readyRef = useRef(true);

  const saveDraft = useCallback(
    (silent = false) => {
      if (!readyRef.current) return;

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      const draft = draftRef.current;
      const lastSaved = lastSavedRef.current;
      if (areDraftsEqual(draft, lastSaved)) {
        if (!silent) setSaveState("saved");
        return;
      }

      const didSave = updateNote(note.id, {
        title: draft.title,
        content: draft.content,
        richContent: draft.richContent,
      });

      if (!didSave) {
        if (!silent) setSaveState("error");
        return;
      }

      lastSavedRef.current = draft;
      if (!silent) setSaveState("saved");
    },
    [note.id, updateNote]
  );

  const scheduleSave = useCallback(() => {
    if (!readyRef.current) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (areDraftsEqual(draftRef.current, lastSavedRef.current)) {
      setSaveState("saved");
      return;
    }

    setSaveState("saving");
    saveTimeoutRef.current = window.setTimeout(() => saveDraft(), 800);
  }, [saveDraft]);

  useEffect(() => {
    const handlePageHide = () => saveDraft(true);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      saveDraft(true);
    };
  }, [saveDraft]);

  function handleTitleChange(nextTitle: string) {
    const currentDraft = draftRef.current;
    const nextDraft = createDraft(nextTitle, currentDraft.content, currentDraft.richContent);
    draftRef.current = nextDraft;
    setTitle(nextTitle);
    scheduleSave();
  }

  const handleContentChange = useCallback(
    (nextContent: { content: string; richContent: RichNoteContent }) => {
      const currentDraft = draftRef.current;
      draftRef.current = createDraft(currentDraft.title, nextContent.content, nextContent.richContent);
      scheduleSave();
    },
    [scheduleSave]
  );

  function handleDeleteNote() {
    if (!window.confirm(`Delete "${getNoteDisplayTitle(note)}" permanently?`)) return;

    readyRef.current = false;
    const didDelete = deleteNote(note.id);
    if (didDelete) router.replace("/notes");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_32rem),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.11),transparent_30rem),#050505] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-4xl flex-col gap-4">
        <header className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-black/30 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/notes"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 text-neutral-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Back to notes"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-300">{getNoteDisplayTitle(note)}</p>
              <p className="mt-0.5 text-xs text-neutral-600">{formatNoteUpdatedAt(note.updatedAt)} · Rich writing shortcuts</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <SaveIndicator state={error ? "error" : saveState} />
            <button
              type="button"
              onClick={handleDeleteNote}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 text-neutral-500 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
              aria-label="Delete note"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {error && (
          <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="flex-1 rounded-[2rem] border border-white/10 bg-black/45 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
          <input
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-3xl font-semibold tracking-tight text-white outline-none placeholder:text-neutral-700 sm:text-5xl"
            autoFocus
          />

          <div className="my-5 h-px bg-white/10 sm:my-6" />

          <NoteRichTextEditor initialContent={initialDraft.richContent} onChange={handleContentChange} />
        </section>
      </div>
    </main>
  );
}

export default function NoteEditor({ noteId }: NoteEditorProps) {
  const router = useRouter();
  const note = useNotesStore((state) => state.notes.find((item) => item.id === noteId));
  const hasHydrated = useNotesStore((state) => state.hasHydrated);
  const isLoading = useNotesStore((state) => state.isLoading);
  const hydrate = useNotesStore((state) => state.hydrate);
  const createNote = useNotesStore((state) => state.createNote);
  const selectNote = useNotesStore((state) => state.selectNote);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    selectNote(noteId);
    return () => selectNote(null);
  }, [noteId, selectNote]);

  function handleCreateReplacement() {
    const nextNote = createNote();
    if (nextNote) router.replace(`/notes/${nextNote.id}`);
  }

  if (!hasHydrated || isLoading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-4xl items-center justify-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-center shadow-2xl shadow-black/30">
            <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
            <h1 className="text-lg font-semibold text-white">Opening note</h1>
            <p className="mt-2 text-sm text-neutral-500">Restoring your saved notes.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-4xl items-center justify-center">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-center shadow-2xl shadow-black/30">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-400">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-xl font-semibold text-white">Note not found</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500">This note may have been deleted or created in another browser.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/notes"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-white/10"
              >
                Back to notes
              </Link>
              <button
                type="button"
                onClick={handleCreateReplacement}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
              >
                Create note
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <NoteEditorForm key={note.id} note={note} />;
}
