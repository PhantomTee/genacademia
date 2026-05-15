import Link from "next/link";
import { LessonMeta, ProjectPath } from "@/lib/curriculum/metadata";

interface Props {
  lesson: LessonMeta;
  projectPath: ProjectPath;
  completed: boolean;
  unlocked: boolean;
}

export function LessonCard({ lesson, projectPath, completed, unlocked }: Props) {
  const title = lesson.titles[projectPath];

  if (!unlocked) {
    return (
      <div className="p-4 border border-ink/10 dark:border-cream-200/10 opacity-40 select-none">
        <div className="text-[10px] font-mono uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-1">
          Lesson {lesson.id}
        </div>
        <div className="text-sm font-medium text-ink/40 dark:text-cream-200/40 truncate">
          {title}
        </div>
      </div>
    );
  }

  return (
    <Link href={`/lesson/${lesson.id}`}>
      <div
        className={[
          "p-4 border transition-all group",
          completed
            ? "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200"
            : "border-ink/20 dark:border-cream-200/20 hover:border-ink dark:hover:border-cream-200",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <span
            className={[
              "text-[10px] font-mono uppercase tracking-widest",
              completed
                ? "text-cream-200/60 dark:text-ink/60"
                : "text-ink/40 dark:text-cream-200/40",
            ].join(" ")}
          >
            Lesson {lesson.id}
          </span>
          {lesson.isCapstone && (
            <span
              className={[
                "text-[9px] font-bold uppercase tracking-widest border px-1",
                completed
                  ? "border-cream-200/30 dark:border-ink/30 text-cream-200/60 dark:text-ink/60"
                  : "border-ink/20 dark:border-cream-200/20 text-ink/40 dark:text-cream-200/40",
              ].join(" ")}
            >
              Capstone
            </span>
          )}
        </div>

        <div
          className={[
            "text-sm font-semibold truncate",
            completed
              ? "text-cream-200 dark:text-ink"
              : "text-ink dark:text-cream-200",
          ].join(" ")}
        >
          {completed && <span className="mr-1.5">✓</span>}
          {title}
        </div>
      </div>
    </Link>
  );
}
