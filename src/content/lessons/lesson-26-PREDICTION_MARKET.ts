import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 26,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 26 — Prediction Market Security Mistakes

### What You'll Learn

Students learn to prevent common errors: resolving twice, staking after close, claiming twice, and using empty evidence.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `assert market_id not in self.market_winning_outcome, "Market already resolved"
Trying to resolve again fails:

Market already resolved
`,
  task: `Add guard inside resolve_with_ai:

assert market_id not in self.market_winning_outcome, "Market already resolved"`,
  hints: [
    "Add guard inside resolve_with_ai:.",
    "assert market_id not in self.market_winning_outcome, 'Market already resolved'",
    "Key line: `assert market_id not in self.market_winning_outcome, 'Market already resolved'`",
  ],
};

export default content;
