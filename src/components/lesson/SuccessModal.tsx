"use client";

import { useRouter } from "next/navigation";

interface Props {
  lessonId: number;
  badgeAwarded: boolean;
  onClose: () => void;
}

export function SuccessModal({ lessonId, badgeAwarded, onClose }: Props) {
  const router = useRouter();
  const nextLesson = lessonId + 1;

  function handleNext() {
    onClose();
    router.push(nextLesson <= 30 ? `/lesson/${nextLesson}` : "/dashboard");
  }

  return (
    <div className="fixed inset-0 bg-ink/60 dark:bg-ink/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-200 dark:bg-ink border border-ink dark:border-cream-200 p-10 max-w-sm w-full text-center space-y-8">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-4">
            {badgeAwarded ? "Badge Earned" : "Lesson Complete"}
          </div>
          <h2 className="text-2xl font-black uppercase text-ink dark:text-cream-200">
            Lesson {lessonId} ✓
          </h2>
          {badgeAwarded && (
            <p className="text-xs uppercase tracking-widest text-ink/60 dark:text-cream-200/60 mt-2">
              Group badge awarded
            </p>
          )}
        </div>

        <p className="text-sm text-ink/60 dark:text-cream-200/60 leading-relaxed">
          Your contract passed verification. Keep building.
        </p>

        <div className="flex flex-col gap-0">
          <button
            onClick={handleNext}
            className="w-full py-3 text-xs font-bold uppercase tracking-widest border border-ink dark:border-cream-200 bg-ink dark:bg-cream-200 text-cream-200 dark:text-ink hover:opacity-80 transition-opacity"
          >
            {nextLesson <= 30 ? "Next Lesson →" : "Back to Dashboard"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-bold uppercase tracking-widest border border-ink/20 dark:border-cream-200/20 -mt-px text-ink/50 dark:text-cream-200/50 hover:text-ink dark:hover:text-cream-200 hover:border-ink dark:hover:border-cream-200 transition-colors"
          >
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
