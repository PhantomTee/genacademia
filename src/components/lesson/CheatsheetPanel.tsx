"use client";

import { CHEATSHEET } from "@/lib/curriculum/cheatsheet";

interface Props {
  currentLessonId: number;
}

export function CheatsheetPanel({ currentLessonId }: Props) {
  const unlocked = CHEATSHEET.filter(
    (e) => e.unlockedByLesson <= currentLessonId
  );
  const locked = CHEATSHEET.filter(
    (e) => e.unlockedByLesson > currentLessonId
  );

  const categories = Array.from(new Set(unlocked.map((e) => e.category)));

  return (
    <div className="p-4 space-y-6">
      {unlocked.length === 0 && (
        <p className="text-sm text-gray-500">
          Complete lessons to unlock cheat sheet entries.
        </p>
      )}

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {cat}
          </h3>
          <div className="space-y-2">
            {unlocked
              .filter((e) => e.category === cat)
              .map((entry) => (
                <div
                  key={entry.title}
                  className="p-3 bg-gray-900 rounded-lg border border-gray-800"
                >
                  <div className="text-xs font-semibold text-white mb-1">
                    {entry.title}
                  </div>
                  <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap break-all mb-1 overflow-x-auto">
                    {entry.code}
                  </pre>
                  <p className="text-xs text-gray-500">{entry.description}</p>
                </div>
              ))}
          </div>
        </div>
      ))}

      {locked.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Locked
          </h3>
          <div className="space-y-1">
            {locked.slice(0, 5).map((entry) => (
              <div
                key={entry.title}
                className="p-2 bg-gray-900/50 rounded border border-gray-800/50 opacity-40"
              >
                <div className="text-xs text-gray-600">
                  🔒 {entry.title} — unlock at Lesson {entry.unlockedByLesson}
                </div>
              </div>
            ))}
            {locked.length > 5 && (
              <div className="text-xs text-gray-600 pl-2">
                +{locked.length - 5} more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
