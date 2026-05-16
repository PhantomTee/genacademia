import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LESSONS } from "@/lib/curriculum/metadata";
import { redirect } from "next/navigation";
import { PathSwitcher } from "@/components/profile/PathSwitcher";
import { NetworkSwitcher } from "@/components/profile/NetworkSwitcher";

const PATH_LABELS: Record<string, string> = {
  PREDICTION_MARKET: "PredictX — Prediction Market",
  FREELANCE_ESCROW: "TrustLance — Freelance Escrow",
  DAO: "GovMind — DAO",
  DEVELOPER_REPUTATION: "CodeVault — Developer Reputation",
  INSURANCE: "CaseWise — Insurance",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  DEVELOPER: "Developer",
  WEB3: "Web3 Native",
};

const GROUP_LABELS: Record<number, string> = {
  1: "Fundamentals",
  2: "Intelligent",
  3: "Collections",
  4: "Non-Determ.",
  5: "Value",
  6: "Production",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.walletAddress) redirect("/");

  const { walletAddress, projectPath, experienceLevel } = session.user;

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

  const earnedGroupIds = new Set(
    user.badges
      .filter((b) => b.projectPath === currentPath)
      .map((b) => b.groupId)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-cream-200/30 mb-1">
          Profile
        </div>
        <h1 className="text-3xl font-black uppercase text-ink dark:text-cream-200">
          {truncated}
        </h1>
        <p className="text-xs text-ink/40 dark:text-cream-200/40 mt-1 font-mono">
          {walletAddress}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
        {[
          { label: "Lessons Complete", value: `${completedForPath.length} / 30` },
          { label: "Badges Earned", value: `${earnedGroupIds.size} / 6` },
          { label: "Contracts Deployed", value: String(deployedContracts.length) },
          { label: "Level", value: LEVEL_LABELS[experienceLevel ?? "DEVELOPER"] },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`p-5 border border-ink/15 dark:border-cream-200/15 ${i > 0 ? "-ml-px" : ""}`}
          >
            <div className="text-2xl font-black text-ink dark:text-cream-200 leading-none mb-1">
              {s.value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <section>
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-4">
          Settings
        </div>
        <div className="space-y-0">
          <div className="flex items-center justify-between p-4 border border-ink/15 dark:border-cream-200/15">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-ink dark:text-cream-200">
                Project Path
              </div>
              <div className="text-xs text-ink/50 dark:text-cream-200/50 mt-0.5">
                {PATH_LABELS[currentPath]}
              </div>
            </div>
            <PathSwitcher currentPath={currentPath} />
          </div>
          <div className="flex items-center justify-between p-4 border border-ink/15 dark:border-cream-200/15 -mt-px">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-ink dark:text-cream-200">
                Network
              </div>
              <div className="text-xs text-ink/50 dark:text-cream-200/50 mt-0.5">
                GenLayer Studionet
              </div>
            </div>
            <NetworkSwitcher />
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-4">
          Badges
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-0">
          {[1, 2, 3, 4, 5, 6].map((groupId, i) => {
            const earned = earnedGroupIds.has(groupId);
            return (
              <div
                key={groupId}
                className={`aspect-square border flex flex-col items-center justify-center gap-1.5 transition-all ${i > 0 ? "-ml-px" : ""} ${
                  earned
                    ? "border-ink dark:border-cream-200 bg-ink dark:bg-cream-200"
                    : "border-ink/10 dark:border-cream-200/10"
                }`}
              >
                {earned ? (
                  <span className="text-xs font-black text-cream-200 dark:text-ink">✓</span>
                ) : (
                  <span className="text-[10px] font-bold text-ink/20 dark:text-cream-200/20">—</span>
                )}
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest leading-tight text-center px-1 ${
                    earned
                      ? "text-cream-200/70 dark:text-ink/70"
                      : "text-ink/25 dark:text-cream-200/25"
                  }`}
                >
                  {GROUP_LABELS[groupId]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deployed Contracts */}
      {deployedContracts.length > 0 && (
        <section>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-4">
            Deployed Contracts
          </div>
          <div className="space-y-0">
            {deployedContracts.map((p) => {
              const lesson = LESSONS.find((l) => l.id === p.lessonId);
              return (
                <div
                  key={p.id}
                  className="p-4 border border-ink/15 dark:border-cream-200/15 -mt-px first:mt-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-tight text-ink dark:text-cream-200">
                      Lesson {p.lessonId}
                      {lesson ? ` — ${lesson.concept}` : ""}
                    </div>
                    <div className="text-[10px] font-mono text-ink/40 dark:text-cream-200/40 mt-0.5 truncate">
                      {p.contractAddress!.slice(0, 10)}...
                      {p.contractAddress!.slice(-8)}
                    </div>
                  </div>
                  {p.txHash && (
                    <a
                      href={`https://explorer-studio.genlayer.com/tx/${p.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 hover:text-ink dark:hover:text-cream-200 transition-colors flex-shrink-0"
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
