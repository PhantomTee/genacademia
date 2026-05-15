import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 19,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 19 — Claim and Refund Patterns

### What You'll Learn

Students learn that claims should only happen after a market is resolved.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add storage:

market_winning_outcome: TreeMap[str, str]
user_claimed: TreeMap[str, bool]
Add a temporary owner-only resolver:

resolve_market_manually(market_id: str, winning_outcome: str)`,
  hints: [
    "Add storage:.",
    "market_winning_outcome: TreeMap[str, str]",
    "Key line: `def resolve_market_manually(self, market_id: str, winning_outcome: str) -> None:`",
  ],
};

export default content;
