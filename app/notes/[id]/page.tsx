import type { Metadata } from "next";
import NoteEditor from "@/components/notes/NoteEditor";

export const metadata: Metadata = {
  title: "Edit Note | Productivity App",
  description: "Write and auto-save a persistent note.",
};

interface NoteEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteEditorPage({ params }: NoteEditorPageProps) {
  const { id } = await params;
  return <NoteEditor noteId={id} />;
}
