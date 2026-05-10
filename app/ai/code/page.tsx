import type { Metadata } from "next";
import CodeAssistantContainer from "@/components/ai/code/CodeAssistantContainer";

export const metadata: Metadata = {
  title: "AI Code Assistant | Productivity App",
  description: "A focused coding assistant powered by OpenRouter and Qwen 3 Coder.",
};

export default function AiCodePage() {
  return <CodeAssistantContainer />;
}
