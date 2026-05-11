"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import type { RichNoteContent } from "@/types/note";
import { noteEditorExtensions } from "./EditorExtensions";
import EditorToolbar from "./EditorToolbar";

interface NoteRichTextEditorProps {
  initialContent: RichNoteContent;
  onChange: (nextContent: { content: string; richContent: RichNoteContent }) => void;
}

export default function NoteRichTextEditor({ initialContent, onChange }: NoteRichTextEditorProps) {
  const editor = useEditor(
    {
      extensions: noteEditorExtensions,
      content: initialContent,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          class: "notes-prosemirror",
          "aria-label": "Note body",
        },
      },
      onUpdate: ({ editor }) => {
        onChange({
          content: editor.getText(),
          richContent: editor.getJSON() as RichNoteContent,
        });
      },
    },
    []
  );

  return (
    <div className="notes-rich-editor">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
