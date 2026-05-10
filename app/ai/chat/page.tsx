import type { Metadata } from "next";
import ChatContainer from "@/components/ai/chat/ChatContainer";

export const metadata: Metadata = {
  title: "AI Chat | Productivity App",
  description: "A minimal AI chat workspace foundation.",
};

export default function AiChatPage() {
  return <ChatContainer />;
}
