import { Bug, Code2, FileCode2, GitPullRequestArrow } from "lucide-react";

const examples = [
  {
    icon: Bug,
    title: "Debug an error",
    description: "Paste a stack trace and ask for the likely root cause.",
  },
  {
    icon: Code2,
    title: "Generate code",
    description: "Describe a function, component, API route, or utility.",
  },
  {
    icon: GitPullRequestArrow,
    title: "Refactor safely",
    description: "Ask for a cleaner implementation with the same behavior.",
  },
  {
    icon: FileCode2,
    title: "Explain code",
    description: "Paste a snippet and get a clear mental model.",
  },
];

export default function CodeEmptyState() {
  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:py-16">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-2xl shadow-cyan-950/30">
        <Code2 className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">What are we building?</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
        Ask Qwen 3 Coder for implementation help, debugging, refactors, explanations, tests, or architecture guidance.
      </p>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {examples.map((example) => {
          const Icon = example.icon;
          return (
            <div key={example.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left shadow-xl shadow-black/10">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-neutral-200">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">{example.title}</h3>
              <p className="mt-2 text-xs leading-5 text-neutral-500">{example.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
