import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 14,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 14 — Market Status Flow

### What You'll Learn

Students learn how to model a lifecycle using status strings.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

close_market(market_id: str)
Only the creator or owner can close a market.`,
  hints: [
    "Add:.",
    "close_market(market_id: str)",
    "Key line: `def close_market(self, market_id: str) -> None:`",
  ],
};

export default content;
