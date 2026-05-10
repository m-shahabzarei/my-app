"use client";

import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import CodeBlock from "./CodeBlock";

interface CodeMarkdownProps {
  content: string;
}

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return getTextContent(node.props.children);
  return "";
}

export default function CodeMarkdown({ content }: CodeMarkdownProps) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      components={{
        h1: ({ children }) => <h1 className="mb-3 mt-6 text-xl font-semibold text-white first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-3 mt-6 text-lg font-semibold text-white first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 mt-5 text-base font-semibold text-white first:mt-0">{children}</h3>,
        p: ({ children }) => <p className="mb-4 leading-7 text-neutral-200 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-5 text-neutral-200 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-5 text-neutral-200 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="leading-7 marker:text-neutral-500">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-neutral-300 last:mb-0">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-cyan-200">
            {children}
          </a>
        ),
        code: ({ className, children }) => {
          const code = getTextContent(children).replace(/\n$/, "");
          const language = className?.match(/language-([^\s]+)/)?.[1] ?? "text";
          const looksLikeBlock = Boolean(className) || code.includes("\n");

          if (!looksLikeBlock) {
            return <code className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-cyan-200">{children}</code>;
          }

          return (
            <CodeBlock code={code} language={language} className={className}>
              {children}
            </CodeBlock>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
