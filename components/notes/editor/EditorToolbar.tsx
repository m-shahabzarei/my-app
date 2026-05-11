"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { Bold, CheckSquare, Code2, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Minus, Quote, Strikethrough, Underline } from "lucide-react";
import type { ReactNode } from "react";

type BlockStyle = "paragraph" | "h1" | "h2" | "h3";

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const emptyToolbarState = {
  blockStyle: "paragraph" as BlockStyle,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isBulletList: false,
  isOrderedList: false,
  isTaskList: false,
  isBlockquote: false,
  isCodeBlock: false,
};

function ToolbarButton({ label, active = false, disabled = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-2.5 text-xs font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-amber-200/25 bg-amber-200/15 text-amber-100 shadow-sm shadow-amber-950/20"
          : "border-white/10 bg-white/[0.035] text-neutral-300 hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px shrink-0 bg-white/10" aria-hidden="true" />;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor }) => ({
        blockStyle: editor?.isActive("heading", { level: 1 })
          ? "h1"
          : editor?.isActive("heading", { level: 2 })
            ? "h2"
            : editor?.isActive("heading", { level: 3 })
              ? "h3"
              : "paragraph",
        isBold: editor?.isActive("bold") ?? false,
        isItalic: editor?.isActive("italic") ?? false,
        isUnderline: editor?.isActive("underline") ?? false,
        isStrike: editor?.isActive("strike") ?? false,
        isBulletList: editor?.isActive("bulletList") ?? false,
        isOrderedList: editor?.isActive("orderedList") ?? false,
        isTaskList: editor?.isActive("taskList") ?? false,
        isBlockquote: editor?.isActive("blockquote") ?? false,
        isCodeBlock: editor?.isActive("codeBlock") ?? false,
      }),
    }) ?? emptyToolbarState;

  const disabled = !editor;

  function setBlockStyle(blockStyle: BlockStyle) {
    if (!editor) return;

    if (blockStyle === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }

    const level = blockStyle === "h1" ? 1 : blockStyle === "h2" ? 2 : 3;
    editor.chain().focus().toggleHeading({ level }).run();
  }

  return (
    <div className="sticky top-3 z-10 -mx-1 mb-5 overflow-x-auto px-1 pb-2 sm:top-4">
      <div className="inline-flex min-w-max items-center gap-1.5 rounded-2xl border border-white/10 bg-neutral-950/85 p-1.5 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <label className="sr-only" htmlFor="note-block-style">
          Text style
        </label>
        <select
          id="note-block-style"
          value={toolbarState.blockStyle}
          disabled={disabled}
          onChange={(event) => setBlockStyle(event.target.value as BlockStyle)}
          className="h-9 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-neutral-200 outline-none transition hover:border-white/18 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <option className="bg-neutral-950" value="paragraph">
            Text
          </option>
          <option className="bg-neutral-950" value="h1">
            Heading 1
          </option>
          <option className="bg-neutral-950" value="h2">
            Heading 2
          </option>
          <option className="bg-neutral-950" value="h3">
            Heading 3
          </option>
        </select>

        <ToolbarDivider />

        <ToolbarButton label="Bold" active={toolbarState.isBold} disabled={disabled} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={toolbarState.isItalic} disabled={disabled} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={toolbarState.isUnderline} disabled={disabled} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <Underline className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Strike" active={toolbarState.isStrike} disabled={disabled} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton label="Heading 1" active={toolbarState.blockStyle === "h1"} disabled={disabled} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Heading 2" active={toolbarState.blockStyle === "h2"} disabled={disabled} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" active={toolbarState.blockStyle === "h3"} disabled={disabled} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton label="Bullet list" active={toolbarState.isBulletList} disabled={disabled} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={toolbarState.isOrderedList} disabled={disabled} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Checklist" active={toolbarState.isTaskList} disabled={disabled} onClick={() => editor?.chain().focus().toggleTaskList().run()}>
          <CheckSquare className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton label="Quote" active={toolbarState.isBlockquote} disabled={disabled} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Code block" active={toolbarState.isCodeBlock} disabled={disabled} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
          <Code2 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Divider" disabled={disabled} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
      </div>
    </div>
  );
}
