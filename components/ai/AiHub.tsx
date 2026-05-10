"use client";

import { aiTools } from "@/config/ai-tools";
import AiPageHeader from "./AiPageHeader";
import AiToolCard from "./AiToolCard";

export default function AiHub() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_28rem),#050505] text-white">
      <div className="mx-auto flex w-full max-w-420 flex-col gap-5 p-4 sm:p-6 xl:p-8">
        <AiPageHeader
          title="AI"
        />

        <main className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {aiTools.map((tool, index) => (
            <AiToolCard key={tool.slug} tool={tool} index={index} />
          ))}
        </main>
      </div>
    </div>
  );
}
