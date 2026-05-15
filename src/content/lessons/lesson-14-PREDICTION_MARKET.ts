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
  expectedCode: `@gl.public.write
def close_market(self, market_id: str) -> None:
    assert market_id in self.market_questions, "Market not found"

    caller = gl.message.sender_address
    creator = self.market_creators[market_id]

    assert caller == creator or caller == self.owner, "Only creator or owner can close market"
    assert self.market_statuses[market_id] == "active", "Only active markets can be closed"

    self.market_statuses[market_id] = "closed"
Before close:

"status": "active"
After close:

"status": "closed"
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
