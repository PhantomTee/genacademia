import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 16 — Payable Staking

### What You'll Learn

Students learn how to receive GEN in a write method.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add stake storage:

market_total_a: TreeMap[str, u256]
market_total_b: TreeMap[str, u256]
Then add a payable method:

stake_on_outcome(market_id: str, outcome: str)`,
  hints: [
    "Add stake storage:.",
    "market_total_a: TreeMap[str, u256]",
    "Key line: `def stake_on_outcome(self, market_id: str, outcome: str) -> None:`",
  ],
};

export default content;
