import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 8,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 8 — Market Fees and Stakes with u256

### What You'll Learn

Students learn how to store numeric values using u256.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `Calling with u256(100) returns:

0
Calling with u256(0) fails with:

Minimum stake must be greater than zero
`,
  task: `Add:

market_min_stakes: TreeMap[str, u256]
Update create_market so it accepts:

min_stake: u256
Validate:

assert min_stake > u256(0), "Minimum stake must be greater than zero"
Expected code additions
market_min_stakes: TreeMap[str, u256]
Updated method:

@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
    assert min_stake > u256(0), "Minimum stake must be greater than zero"

    market_id = "0"
    self.market_creators[market_id] = gl.message.sender_address
    self.market_questions[market_id] = question
    self.market_outcome_a[market_id] = outcome_a
    self.market_outcome_b[market_id] = outcome_b
    self.market_min_stakes[market_id] = min_stake
    self.market_statuses[market_id] = "active"

    return market_id`,
  hints: [
    "Add:.",
    "market_min_stakes: TreeMap[str, u256]",
    "Key line: `Calling with u256(100) returns:`",
  ],
};

export default content;
