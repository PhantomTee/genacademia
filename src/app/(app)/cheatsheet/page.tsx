import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CHEATSHEET } from "@/lib/curriculum/cheatsheet";

export default async function CheatsheetPage() {
  const session = await getServerSession(authOptions);
  const projectPath = session!.user.projectPath!;

  const user = await prisma.user.findUnique({
    where: { walletAddress: session!.user.walletAddress },
    include: { progress: true },
  });

  const completedIds = (user?.progress ?? [])
    .filter((p) => p.completed && p.projectPath === projectPath)
    .map((p) => p.lessonId);

  const maxCompleted = completedIds.length > 0 ? Math.max(...completedIds) : 0;
  const categories = Array.from(new Set(CHEATSHEET.map((e) => e.category)));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-cream-200/30 mb-1">
          Reference
        </div>
        <h1 className="text-3xl font-black uppercase text-ink dark:text-cream-200">
          Cheat Sheet
        </h1>
        <p className="text-sm text-ink/50 dark:text-cream-200/50 mt-1">
          {CHEATSHEET.filter((e) => e.unlockedByLesson <= maxCompleted).length} / {CHEATSHEET.length} entries unlocked
        </p>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => {
          const catEntries = CHEATSHEET.filter((e) => e.category === cat);
          return (
            <div key={cat}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-4 pb-2 border-b border-ink/10 dark:border-cream-200/10">
                {cat}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {catEntries.map((entry, i) => {
                  const isLocked = entry.unlockedByLesson > maxCompleted;
                  return (
                    <div
                      key={entry.title}
                      className={`p-4 border border-ink/10 dark:border-cream-200/10 -mt-px first:mt-0 ${i % 2 === 1 ? "-ml-px" : ""} ${
                        isLocked ? "opacity-30" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="text-xs font-bold uppercase tracking-tight text-ink dark:text-cream-200">
                          {entry.title}
                        </div>
                        {isLocked && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 flex-shrink-0">
                            Lesson {entry.unlockedByLesson}
                          </span>
                        )}
                      </div>
                      {!isLocked && (
                        <>
                          <pre className="text-[11px] font-mono text-ink dark:text-cream-200 bg-ink/5 dark:bg-cream-200/5 border border-ink/10 dark:border-cream-200/10 p-3 mb-2 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                            {entry.code}
                          </pre>
                          <p className="text-xs text-ink/50 dark:text-cream-200/50 leading-relaxed">
                            {entry.description}
                          </p>
                          <a
                            href={entry.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-cream-200/30 hover:text-ink dark:hover:text-cream-200 transition-colors mt-2 block"
                          >
                            Docs →
                          </a>
                        </>
                      )}
                      {isLocked && (
                        <div className="text-[10px] text-ink/30 dark:text-cream-200/30 uppercase tracking-widest">
                          Locked
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
