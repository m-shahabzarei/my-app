import { Sparkles } from "lucide-react";

interface AiPageHeaderProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function AiPageHeader({ eyebrow = "AI Workspace", title, description, action }: AiPageHeaderProps) {
  return (
    <header className="rounded-3xl border border-white/10 bg-white/4 shadow-2xl shadow-black/20 h-[60px] px-6 flex items-center">
      <div className="flex flex-col gap-4 w-full lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm text-neutral-400">
            <Sparkles className="h-4 w-4" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
