import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 24,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 24 — Structured Resolution Output

### What You'll Learn

Students learn how to store and expose AI reasoning.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `After AI resolution:

{
  "winning_outcome": "A",
  "resolution_reason": "Evidence indicates outcome A happened."
}
`,
  task: `Add:

market_resolution_reason: TreeMap[str, str]
Store the AI reason.

Update get_market_json to include:

"winning_outcome"
"resolution_reason"
Expected code additions
market_resolution_reason: TreeMap[str, str]
Inside resolve_with_ai:

self.market_winning_outcome[market_id] = winning_outcome
self.market_resolution_reason[market_id] = reason
self.market_statuses[market_id] = "resolved"
Inside get_market_json:

"winning_outcome": self.market_winning_outcome[market_id] if market_id in self.market_winning_outcome else "",
"resolution_reason": self.market_resolution_reason[market_id] if market_id in self.market_resolution_reason else "",`,
  hints: [
    "Add:.",
    "market_resolution_reason: TreeMap[str, str]",
    "Key line: `After AI resolution:`",
  ],
};

export default content;
