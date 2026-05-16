import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  LESSONS,
  getLessonsInGroup,
  isLessonUnlocked,
  type ProjectPath,
} from "@/lib/curriculum/metadata";

const LESSON_GROUPS = [1, 2, 3, 4, 5, 6] as const;
import { LessonCard } from "@/components/curriculum/LessonCard";
import { CertificateButton } from "@/components/curriculum/CertificateButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const projectPath = session!.user.projectPath as ProjectPath;

  const user = await prisma.user.findUnique({
    where: { walletAddress: session!.user.walletAddress },
    include: { progress: true, badges: true },
  });

  const completedIds = (user?.progress ?? [])
    .filter((p) => p.completed && p.projectPath === projectPath)
    .map((p) => p.lessonId);

  const totalComplete = completedIds.length;

  const GROUP_LABELS: Record<number, string> = {
    1: "Fundamentals",
    2: "Intelligent Features",
    3: "Collections & State",
    4: "Advanced Non-Determinism",
    5: "Value & Integration",
    6: "Production Readiness",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-ink dark:text-cream-200">Your Curriculum</h1>
          <p className="text-ink/50 dark:text-cream-200/50 mt-1 text-sm">
            {totalComplete} / {LESSONS.length} lessons complete
          </p>
        </div>
        {totalComplete >= LESSONS.length && (
          <CertificateButton track={projectPath} />
        )}
      </div>

      <div className="space-y-10">
        {LESSON_GROUPS.map((groupId) => {
          const lessons = getLessonsInGroup(groupId);
          const groupComplete = lessons.filter((l) =>
            completedIds.includes(l.id)
          ).length;

          return (
            <div key={groupId}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-ink dark:text-cream-200">
                  Group {groupId}: {GROUP_LABELS[groupId]}
                </h2>
                <span className="text-xs text-ink/40 dark:text-cream-200/40 font-mono">
                  {groupComplete} / {lessons.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    projectPath={projectPath}
                    completed={completedIds.includes(lesson.id)}
                    unlocked={isLessonUnlocked(lesson.id, completedIds)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
