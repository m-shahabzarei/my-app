import type { Metadata } from "next";
import NotesListPage from "@/components/notes/NotesListPage";

export const metadata: Metadata = {
  title: "Notes | Productivity App",
  description: "Create and edit fast, persistent notes.",
};

export default function NotesPage() {
  return <NotesListPage />;
}
