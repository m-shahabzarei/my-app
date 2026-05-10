import type { Metadata } from "next";
import AiHub from "@/components/ai/AiHub";

export const metadata: Metadata = {
  title: "AI | Productivity App",
  description: "A modular AI workspace foundation.",
};

export default function AiPage() {
  return <AiHub />;
}
