"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface Props {
  explanation: string;
  task: string;
  docUrl: string;
}

export function ContentRenderer({ explanation, task, docUrl }: Props) {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="prose dark:prose-invert prose-sm max-w-none
        prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
        prose-headings:text-ink dark:prose-headings:text-cream-200
        prose-p:text-ink/80 dark:prose-p:text-cream-200/80
        prose-strong:text-ink dark:prose-strong:text-cream-200
        prose-code:text-ink dark:prose-code:text-cream-200
        prose-code:bg-ink/5 dark:prose-code:bg-cream-200/5
        prose-code:rounded-none
        prose-a:text-ink dark:prose-a:text-cream-200
        prose-li:text-ink/80 dark:prose-li:text-cream-200/80
        prose-pre:bg-ink dark:prose-pre:bg-cream-200/5
        prose-pre:rounded-none prose-pre:border
        prose-pre:border-ink/10 dark:prose-pre:border-cream-200/10">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {explanation}
        </ReactMarkdown>
      </div>

      <div className="border border-ink/20 dark:border-cream-200/20 p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-2">
          Your Task
        </div>
        <div className="text-sm text-ink dark:text-cream-200 leading-relaxed">
          {task}
        </div>
      </div>

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
