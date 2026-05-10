import { Bot } from "lucide-react";

export default function EmptyChatState() {
  return (
    <div className="flex min-h-[44vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white shadow-2xl shadow-black/30">
        <Bot className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-white">Start a conversation</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-400">
        Choose a model when providers are connected, then use this space for fast AI conversations.
      </p>
    </div>
  );
}
