"use client";

import { useEffect, useState } from "react";
import { getLessonsInGroup } from "@/lib/curriculum/metadata";

interface Props {
  groupId: number;
  projectPath: string;
}

export function GroupProgressBar({ groupId, projectPath }: Props) {
  const lessons = getLessonsInGroup(groupId);
  const total = lessons.length;
  const lessonIds = lessons.map((l) => l.id);

  const [completed, setCompleted] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => {
        const count = (d.progress ?? []).filter(
          (p: { lessonId: number; projectPath: string; completed: boolean }) =>
            p.completed &&
            p.projectPath === projectPath &&
            lessonIds.includes(p.lessonId)
        ).length;
        setCompleted(count);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, projectPath]);

  if (completed === null) return <div className="h-0.5 w-full" />;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="relative h-0.5 w-full bg-ink/10 dark:bg-cream-200/10">
      <div
        className="absolute inset-y-0 left-0 bg-ink dark:bg-cream-200 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
      {completed > 0 && (
        <span className="absolute right-0 -top-5 text-[10px] font-mono text-ink/30 dark:text-cream-200/30">
          {completed}/{total}
        </span>
      )}
    </div>
  );
}
