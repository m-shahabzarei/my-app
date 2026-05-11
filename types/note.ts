export type RichNoteContent = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: RichNoteContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  richContent?: RichNoteContent;
  createdAt: string;
  updatedAt: string;
};

export type NoteUpdate = Partial<Pick<Note, "title" | "content" | "richContent">>;
