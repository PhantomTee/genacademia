import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LESSONS } from "@/lib/curriculum/metadata";
import { redirect } from "next/navigation";
import { PathSwitcher } from "@/components/profile/PathSwitcher";
import { NetworkSwitcher } from "@/components/profile/NetworkSwitcher";

const PATH_LABELS: Record<string, string> = {
  PREDICTION_MARKET: "Prediction Market",
  FREELANCE_ESCROW: "Freelance Escrow",
  DAO: "DAO",
  DEVELOPER_REPUTATION: "Developer Reputation",
  INSURANCE: "Insurance",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  DEVELOPER: "Developer",
  WEB3: "Web3 Native",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) redirect("/");

  const { walletAddress, projectPath, experienceLevel } =
    session.user;

  const user = await prisma.user.findUnique({
    where: { walletAddress },
    include: {
      progress: { orderBy: { lessonId: "asc" } },
      badges: true,
    },
  });

  if (!user) redirect("/");

  const currentPath = projectPath ?? "PREDICTION_MARKET";
  const completedForPath = user.progress.filter(
    (p) => p.completed && p.projectPath === currentPath
  );
  const deployedContracts = user.progress.filter(
    (p) => p.contractAddress && p.projectPath === currentPath
  );

  const truncated =
    walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);

  // Which group badges are earned for current path?
  const earnedGroupIds = new Set(
    user.badges
      .filter((b) => b.projectPath === currentPath)
      .map((b) => b.groupId)
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1 font-mono text-sm">{truncated}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Lessons Complete" value={`${completedForPath.length} / 30`} />
        <StatCard label="Badges Earned" value={`${earnedGroupIds.size} / 6`} />
        <StatCard label="Contracts Deployed" value={String(deployedContracts.length)} />
        <StatCard label="Level" value={LEVEL_LABELS[experienceLevel ?? "DEVELOPER"]} />
      </div>

      {/* Settings */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">
          Settings
        </h2>
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <div className="text-sm font-medium text-white">Project Path</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {PATH_LABELS[currentPath]}
              </div>
            </div>
            <PathSwitcher currentPath={currentPath} />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <div className="text-sm font-medium text-white">Network</div>
              <div className="text-xs text-gray-400 mt-0.5">GenLayer Studionet</div>
            </div>
            <NetworkSwitcher />
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 mb-4">
          Badges
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((groupId) => {
            const earned = earnedGroupIds.has(groupId);
            return (
              <div
                key={groupId}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  earned
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : "border-gray-800 bg-gray-900/50 opacity-30"
                }`}
              >
                <span className="text-2xl">{earned ? "🏆" : "🔒"}</span>
                <span className="text-xs text-gray-400">Group {groupId}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deployed Contracts */}
      {deployedContracts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2 mb-4">
            Deployed Contracts
          </h2>
          <div className="space-y-2">
            {deployedContracts.map((p) => {
              const lesson = LESSONS.find((l) => l.id === p.lessonId);
              return (
                <div
                  key={p.id}
                  className="p-3 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm text-white">
                      Lesson {p.lessonId}
                      {lesson ? ` — ${lesson.concept}` : ""}
                    </div>
                    <div className="text-xs font-mono text-gray-400 mt-0.5">
                      {p.contractAddress!.slice(0, 10)}...
                      {p.contractAddress!.slice(-8)}
                    </div>
                  </div>
                  {p.txHash && (
                    <a
                      href={`https://studio.genlayer.com/transactions/${p.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex-shrink-0"
                    >
                      View →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
