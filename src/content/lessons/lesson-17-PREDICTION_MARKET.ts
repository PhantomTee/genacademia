import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 17,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 17 — Preventing Bad Stakes

### What You'll Learn

Students learn stricter validation and safer user flows.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `assert gl.message.sender_address != self.market_creators[market_id], "Creator cannot stake on own market"
If creator tries to stake:

Creator cannot stake on own market
`,
  task: `Prevent the market creator from staking in their own market.

Add inside stake_on_outcome:

assert gl.message.sender_address != self.market_creators[market_id], "Creator cannot stake on own market"`,
  hints: [
    "Prevent the market creator from staking in their own market.",
    "Add inside stake_on_outcome:",
    "Key line: `assert gl.message.sender_address != self.market_creators[market_id], 'Creator cannot stake on own market'`",
  ],
};

export default content;
