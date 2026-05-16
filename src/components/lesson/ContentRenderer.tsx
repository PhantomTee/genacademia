"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { DiffView } from "./DiffView";
import type { Components } from "react-markdown";

interface Props {
  explanation: string;
  task: string;
  docUrl: string;
  starterCode?: string;
  expectedCode?: string;
  prevCode?: string;
}

const mdComponents: Components = {
  h1: ({ children }) => (
    <div className="border border-ink/30 dark:border-cream-200/30 px-4 py-3 mb-4">
      <h1 className="text-base font-black uppercase tracking-tight text-ink dark:text-cream-200 m-0">
        {children}
      </h1>
    </div>
  ),
  h2: ({ children }) => (
    <div className="border border-ink/20 dark:border-cream-200/20 px-3 py-2 mb-3 mt-6">
      <h2 className="text-sm font-black uppercase tracking-tight text-ink dark:text-cream-200 m-0">
        {children}
      </h2>
    </div>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-ink dark:text-cream-200 underline underline-offset-2 mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-ink/80 dark:text-cream-200/80 leading-relaxed mb-3">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-ink/80 dark:text-cream-200/80">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-ink/80 dark:text-cream-200/80">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-ink/80 dark:text-cream-200/80">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-ink dark:text-cream-200">{children}</strong>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="text-xs bg-ink/5 dark:bg-cream-200/5 px-1 py-0.5 rounded-none font-mono text-ink dark:text-cream-200">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="bg-ink/90 dark:bg-cream-200/5 border border-ink/10 dark:border-cream-200/10 p-4 overflow-x-auto text-xs mb-3 rounded-none">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink dark:text-cream-200 underline underline-offset-2 hover:opacity-70"
    >
      {children}
    </a>
  ),
};

export function ContentRenderer({ explanation, task, docUrl, starterCode, expectedCode, prevCode }: Props) {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]} components={mdComponents}>
        {explanation}
      </ReactMarkdown>

      {prevCode && starterCode && prevCode !== starterCode && (
        <DiffView
          starterCode={prevCode}
          expectedCode={starterCode}
          title="What changed since last lesson"
          defaultOpen={true}
        />
      )}

      <div className="border border-ink/20 dark:border-cream-200/20 p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-2">
          Your Task
        </div>
        <div className="text-sm text-ink dark:text-cream-200 leading-relaxed">
          {task}
        </div>
      </div>

      {starterCode && expectedCode && expectedCode !== starterCode && (
        <DiffView starterCode={starterCode} expectedCode={expectedCode} />
      )}

      <a
        href={docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-ink/50 dark:text-cream-200/50 hover:text-ink dark:hover:text-cream-200 transition-colors"
      >
        View documentation →
      </a>
    </div>
  );
}
