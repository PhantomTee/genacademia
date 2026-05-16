"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BasicLesson } from "@/content/basics/lessons";
import { BASICS_LESSONS } from "@/content/basics/lessons";
import { MarkdownContent } from "./MarkdownContent";
import { FaucetLesson } from "./FaucetLesson";
import { DeployReadLesson } from "./DeployReadLesson";
import { DeployWriteLesson } from "./DeployWriteLesson";

interface Props {
  lesson: BasicLesson;
  prev: number | null;
  next: number | null;
}

export function BasicsShell({ lesson, prev, next }: Props) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);

  async function handleComplete() {
    setCompleting(true);
    await fetch(`/api/basics/${lesson.id}/complete`, { method: "POST" });
    setCompleting(false);
    setDone(true);
    await new Promise((r) => setTimeout(r, 700));
    if (next) {
      router.push(`/basics/${next}`);
    } else {
      setAllDone(true);
    }
  }

  const isInteractive = lesson.type !== "read";
  const total = BASICS_LESSONS.length;

  return (
    <>
      {/* All-done interstitial */}
      {allDone && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-200 dark:bg-ink px-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-cream-200/30 mb-4">
            GenLayer Basics
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-ink dark:text-cream-200 mb-4 text-center">
            Basics Complete
          </h1>
          <p className="text-sm text-ink/50 dark:text-cream-200/50 mb-10 text-center max-w-sm leading-relaxed">
            You can deploy, read, and write GenLayer contracts. Time to build something real.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="py-3 px-8 text-sm font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
          >
            Go to Dashboard →
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/basics"
            className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 hover:text-ink dark:hover:text-cream-200 transition-colors"
          >
            ← Basics
          </Link>
          <span className="text-xs font-bold text-ink/30 dark:text-cream-200/30">
            {lesson.id} / {total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 bg-ink/10 dark:bg-cream-200/10 mb-8">
          <div
            className="h-full bg-ink dark:bg-cream-200 transition-all"
            style={{ width: `${(lesson.id / total) * 100}%` }}
          />
        </div>

        {/* Lesson header */}
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-cream-200/30 mb-2">
            Lesson {lesson.id}
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink dark:text-cream-200">
            {lesson.title}
          </h1>
          <p className="text-sm text-ink/50 dark:text-cream-200/50 mt-1">{lesson.subtitle}</p>
        </div>

        {/* Explanation */}
        <div className="mb-8">
          <MarkdownContent content={lesson.explanation} />
        </div>

        {/* Code example */}
        {lesson.codeExample && (
          <div className="mb-8">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-cream-200/30 mb-3">
              Contract code
            </div>
            <pre className="bg-ink/5 dark:bg-cream-200/5 border border-ink/10 dark:border-cream-200/10 p-4 overflow-x-auto text-xs font-mono leading-relaxed text-ink dark:text-cream-200">
              <code>{lesson.codeExample}</code>
            </pre>
          </div>
        )}

        {/* Interactive component */}
        {lesson.type === "faucet" && (
          <FaucetLesson lessonId={lesson.id} nextId={next} />
        )}
        {lesson.type === "deploy-read" && (
          <DeployReadLesson lessonId={lesson.id} nextId={next} />
        )}
        {lesson.type === "deploy-write" && (
          <DeployWriteLesson lessonId={lesson.id} nextId={next} />
        )}

        {/* Read-only lesson: just mark complete */}
        {!isInteractive && (
          <div className="space-y-4">
            <div className="border border-ink/10 dark:border-cream-200/10 p-4">
              <p className="text-xs text-ink/40 dark:text-cream-200/40">
                Read through the explanation above, then mark this lesson complete to continue.
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={completing || done}
              className={`w-full py-3 text-sm font-bold uppercase tracking-widest border transition-all ${
                done
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 disabled:opacity-30"
              }`}
            >
              {done
                ? "✓ Complete"
                : completing
                ? "Saving..."
                : next
                ? "Got it — Next lesson →"
                : "Complete basics →"}
            </button>
          </div>
        )}

        {/* Prev / Next nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink/10 dark:border-cream-200/10">
          {prev ? (
            <Link
              href={`/basics/${prev}`}
              className="text-xs uppercase tracking-widest text-ink/30 dark:text-cream-200/30 hover:text-ink dark:hover:text-cream-200 transition-colors"
            >
              ← Lesson {prev}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/basics/${next}`}
              className="text-xs uppercase tracking-widest text-ink/30 dark:text-cream-200/30 hover:text-ink dark:hover:text-cream-200 transition-colors"
            >
              Lesson {next} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </>
  );
}
