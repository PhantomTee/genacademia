import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 11,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 11 — Indexing Markets with DynArray

### What You'll Learn

Students learn that a counter alone is not enough for frontend listing. The contract needs an index of market IDs.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

market_ids: DynArray[str]
Then inside create_market:

self.market_ids.append(market_id)
Code additions
market_ids: DynArray[str]
Inside create_market:

self.market_ids.append(market_id)`,
  hints: [
    "Add:.",
    "market_ids: DynArray[str]",
    "Key line: `After creating two markets, market_ids contains:`",
  ],
};

export default content;
