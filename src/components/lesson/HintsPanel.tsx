"use client";

interface Props {
  lessonId: number;
  hints: [string, string, string];
  revealed: number[];
  onReveal: (index: number) => void;
}

export function HintsPanel({ lessonId, hints, revealed, onReveal }: Props) {
  async function handleReveal(index: number) {
    if (revealed.includes(index)) return;
    onReveal(index);
    await fetch(`/api/progress/${lessonId}/hints`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hintsRevealed: [...revealed, index] }),
    });
  }

  const nextToReveal = revealed.length;

  return (
    <div className="p-4 space-y-3 font-mono">
      <p className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream-200/40">
        Hints reveal one at a time.
      </p>

      {hints.map((hint, i) => (
        <div key={i} className="border border-ink/15 dark:border-cream-200/15">
          {revealed.includes(i) ? (
            <div className="p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-cream-200/40 mb-2">
                Hint {i + 1}
              </div>
              <div className="text-xs text-ink dark:text-cream-200 leading-relaxed normal-case">
                {hint}
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleReveal(i)}
              disabled={i !== nextToReveal}
              className={[
                "w-full p-4 text-left text-xs uppercase tracking-widest transition-colors",
                i === nextToReveal
                  ? "text-ink dark:text-cream-200 hover:bg-ink/5 dark:hover:bg-cream-200/5"
                  : "text-ink/20 dark:text-cream-200/20 cursor-not-allowed",
              ].join(" ")}
            >
              {i === nextToReveal ? `Reveal Hint ${i + 1}` : `Hint ${i + 1}`}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
