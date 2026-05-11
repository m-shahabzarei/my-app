"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, NotebookPen, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatNoteUpdatedAt, getNoteDisplayTitle, getNotePreview, sortNotesByUpdatedDesc } from "@/lib/notes";
import { useNotesStore } from "@/store/notes-store";
import type { Note } from "@/types/note";

function NotesLoadingState() {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="h-4 w-2/5 rounded-full bg-white/10" />
          <div className="mt-3 h-3 w-4/5 rounded-full bg-white/8" />
          <div className="mt-3 h-3 w-28 rounded-full bg-white/8" />
        </div>
      ))}
    </div>
  );
}

function NoteRow({ note, onDelete }: { note: Note; onDelete: (note: Note) => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="group relative"
    >
      <Link
        href={`/notes/${note.id}`}
        className="block rounded-2xl border border-transparent bg-white/[0.025] p-4 pr-14 transition hover:border-white/10 hover:bg-white/[0.06]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">{getNoteDisplayTitle(note)}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-400">{getNotePreview(note)}</p>
          </div>
          <span className="hidden shrink-0 text-xs text-neutral-500 sm:block">{formatNoteUpdatedAt(note.updatedAt)}</span>
        </div>
        <span className="mt-3 block text-xs text-neutral-500 sm:hidden">{formatNoteUpdatedAt(note.updatedAt)}</span>
      </Link>

      <button
        type="button"
        onClick={() => onDelete(note)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-neutral-600 opacity-100 transition hover:bg-red-500/10 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label={`Delete ${getNoteDisplayTitle(note)}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.article>
  );
}

export default function NotesListPage() {
  const router = useRouter();
  const notes = useNotesStore((state) => state.notes);
  const hasHydrated = useNotesStore((state) => state.hasHydrated);
  const isLoading = useNotesStore((state) => state.isLoading);
  const error = useNotesStore((state) => state.error);
  const hydrate = useNotesStore((state) => state.hydrate);
  const createNote = useNotesStore((state) => state.createNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const [query, setQuery] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sortedNotes = sortNotesByUpdatedDesc(notes);

    if (!normalizedQuery) return sortedNotes;

    return sortedNotes.filter((note) => {
      const title = note.title.toLowerCase();
      const content = note.content.toLowerCase();
      return title.includes(normalizedQuery) || content.includes(normalizedQuery);
    });
  }, [notes, query]);

  function handleCreateNote() {
    const note = createNote();
    if (note) router.push(`/notes/${note.id}`);
  }

  function handleDeleteNote(note: Note) {
    const title = getNoteDisplayTitle(note);
    if (!window.confirm(`Delete "${title}" permanently?`)) return;
    deleteNote(note.id);
  }

  const emptySearch = hasHydrated && notes.length > 0 && visibleNotes.length === 0;
  const emptyNotes = hasHydrated && notes.length === 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.13),transparent_32rem),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30rem),#050505] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-neutral-300">
              <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
              Permanent notes
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Notes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              Fast local notes with rich writing shortcuts, instant search, and automatic saving.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateNote}
            disabled={!hasHydrated || isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New note
          </button>
        </header>

        {error && (
          <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="border-b border-white/10 p-3 sm:p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or content"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/25 focus:bg-white/[0.06]"
              />
            </label>
          </div>

          {!hasHydrated || isLoading ? (
            <NotesLoadingState />
          ) : emptyNotes ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-neutral-300">
                <FileText className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">Create your first note</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                Capture ideas, plans, drafts, and reference material in one permanent place.
              </p>
              <button
                type="button"
                onClick={handleCreateNote}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create your first note
              </button>
            </div>
          ) : emptySearch ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-14 text-center">
              <Search className="h-8 w-8 text-neutral-600" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-white">No matching notes</h2>
              <p className="mt-2 text-sm text-neutral-500">Try a different title or phrase.</p>
            </div>
          ) : (
            <div className="space-y-3 p-3 sm:p-4">
              <AnimatePresence initial={false}>
                {visibleNotes.map((note) => (
                  <NoteRow key={note.id} note={note} onDelete={handleDeleteNote} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
