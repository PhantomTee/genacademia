"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BASICS_LESSONS } from "@/content/basics/lessons";

export default function BasicsPage() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/basics/progress")
      .then((r) => r.json())
      .then((data: { completed?: number[] }) => {
        setCompleted(new Set(data.completed ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = completed.size;
  const nextLesson = BASICS_LESSONS.find((l) => !completed.has(l.id));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase text-ink dark:text-cream-200">
          Basics
        </h1>
        <p className="text-sm text-ink/60 dark:text-cream-200/60 mt-2">
          The fundamentals of GenLayer development. Complete the first three to unlock your curriculum.
        </p>
        {!loading && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1 bg-ink/10 dark:bg-cream-200/10">
              <div
                className="h-full bg-ink dark:bg-cream-200 transition-all"
                style={{ width: `${(completedCount / BASICS_LESSONS.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-ink/40 dark:text-cream-200/40 whitespace-nowrap">
              {completedCount} / {BASICS_LESSONS.length}
            </span>
          </div>
        )}
      </div>

      {nextLesson && (
        <Link
          href={`/basics/${nextLesson.id}`}
          className="block mb-6 p-4 border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">
            Continue where you left off
          </div>
          <div className="text-sm font-bold uppercase tracking-tight">
            {nextLesson.id}. {nextLesson.title} →
          </div>
        </Link>
      )}

      <div className="space-y-0">
        {BASICS_LESSONS.map((lesson) => {
          const done = completed.has(lesson.id);
          const isCurrent = !loading && lesson.id === nextLesson?.id;
          return (
            <Link
              key={lesson.id}
              href={`/basics/${lesson.id}`}
              className={`flex items-center gap-4 p-4 border -mt-px first:mt-0 transition-all group ${
                done
                  ? "border-ink/10 dark:border-cream-200/10"
                  : isCurrent
                  ? "border-ink/40 dark:border-cream-200/40 hover:border-ink dark:hover:border-cream-200"
                  : "border-ink/15 dark:border-cream-200/15 hover:border-ink/40 dark:hover:border-cream-200/40"
              }`}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-bold border flex-shrink-0 transition-colors ${
                  done
                    ? "border-ink/20 dark:border-cream-200/20 text-ink/30 dark:text-cream-200/30"
                    : isCurrent
                    ? "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink"
                    : "border-ink/20 dark:border-cream-200/20 text-ink/40 dark:text-cream-200/40"
                }`}
              >
                {done ? "✓" : lesson.id}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-bold uppercase tracking-tight transition-colors ${
                    done
                      ? "text-ink/30 dark:text-cream-200/30"
                      : "text-ink dark:text-cream-200"
                  }`}
                >
                  {lesson.title}
                </div>
                <div className="text-xs text-ink/40 dark:text-cream-200/40 mt-0.5 truncate">
                  {lesson.subtitle}
                </div>
              </div>
              <div
                className={`text-[10px] font-bold uppercase tracking-widest flex-shrink-0 transition-colors ${
                  done
                    ? "text-ink/20 dark:text-cream-200/20"
                    : "text-ink/30 dark:text-cream-200/30 group-hover:text-ink/60 dark:group-hover:text-cream-200/60"
                }`}
              >
                {done ? "Done" : lesson.type === "faucet" ? "Interactive" : lesson.type === "deploy-read" || lesson.type === "deploy-write" ? "Interactive" : "Read"}
              </div>
            </Link>
          );
        })}
      </div>

      {completedCount >= 3 && (
        <div className="mt-8 p-4 border border-ink/20 dark:border-cream-200/20 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
            Curriculum unlocked
          </div>
          <p className="text-sm text-ink/70 dark:text-cream-200/70">
            You have completed the basics. Your 30-lesson curriculum is ready.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-5 py-2.5 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
          >
            Go to curriculum →
          </Link>
        </div>
      )}
    </div>
  );
}
