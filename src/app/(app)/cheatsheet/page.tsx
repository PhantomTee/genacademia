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

  const unlocked = CHEATSHEET.filter((e) => e.unlockedByLesson <= maxCompleted);
  const locked = CHEATSHEET.filter((e) => e.unlockedByLesson > maxCompleted);
  const categories = Array.from(new Set(CHEATSHEET.map((e) => e.category)));

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Cheat Sheet</h1>
        <p className="text-gray-400 mt-1">
          {unlocked.length} / {CHEATSHEET.length} entries unlocked
        </p>
      </div>

      <div className="space-y-10">
        {categories.map((cat) => {
          const catEntries = CHEATSHEET.filter((e) => e.category === cat);
          return (
            <div key={cat}>
              <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 mb-4">
                {cat}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {catEntries.map((entry) => {
                  const isLocked = entry.unlockedByLesson > maxCompleted;
                  return (
                    <div
                      key={entry.title}
                      className={`p-4 rounded-xl border ${
                        isLocked
                          ? "border-gray-800 bg-gray-900/30 opacity-40"
                          : "border-gray-700 bg-gray-900"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-white">
                          {isLocked ? "🔒 " : ""}
                          {entry.title}
                        </div>
                        {isLocked && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            Lesson {entry.unlockedByLesson}
                          </span>
                        )}
                      </div>
                      {!isLocked && (
                        <>
                          <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap bg-black/30 p-2 rounded mb-2 overflow-x-auto">
                            {entry.code}
                          </pre>
                          <p className="text-xs text-gray-400">
                            {entry.description}
                          </p>
                          <a
                            href={entry.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 block"
                          >
                            Docs →
                          </a>
                        </>
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
