export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  model?: "gemini" | "gpt";
}

export interface ChatResponse {
  response: string;
}

export interface AIModel {
  id: "gemini" | "gpt";
  name: string;
  enabled: boolean;
}

export interface AITool {
  id: "chat" | "image" | "video" | "powerpoint";
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  href: string;
}