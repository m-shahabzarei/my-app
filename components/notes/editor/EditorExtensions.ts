import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

export const noteEditorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    codeBlock: {
      HTMLAttributes: {
        class: "notes-code-block",
      },
    },
    horizontalRule: {
      HTMLAttributes: {
        class: "notes-horizontal-rule",
      },
    },
    underline: false,
  }),
  Underline,
  TaskList.configure({
    HTMLAttributes: {
      class: "notes-task-list",
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: "notes-task-item",
    },
  }),
  Placeholder.configure({
    placeholder: "Start writing...",
    includeChildren: true,
  }),
  Typography,
];
