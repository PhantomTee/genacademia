import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 20 — Major Upgrade: Full Prediction Value Flow

### What You'll Learn

Students implement a simple claim method. This lesson focuses on state checks, not perfect payout math.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.write
def claim_winnings(self, market_id: str) -> None:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "resolved", "Market is not resolved"

    caller_hex = gl.message.sender_address.as_hex
    claim_key = market_id + "_" + caller_hex

    if claim_key in self.user_claimed:
        assert self.user_claimed[claim_key] == False, "Already claimed"

    winning_outcome = self.market_winning_outcome[market_id]

    if winning_outcome == "A":
        assert claim_key in self.user_stakes_a, "No winning stake found"
    elif winning_outcome == "B":
        assert claim_key in self.user_stakes_b, "No winning stake found"
    else:
        assert False, "Invalid resolved outcome"

    self.user_claimed[claim_key] = True
A winning user can claim once.

Second claim fails with:

Already claimed
A losing user fails with:

No winning stake found
`,
  task: `Add:

claim_winnings(market_id: str)
For now, it should mark the user as claimed if they backed the winning side. The actual transfer/payout lesson can be advanced content later.`,
  hints: [
    "Add:.",
    "claim_winnings(market_id: str)",
    "Key line: `def claim_winnings(self, market_id: str) -> None:`",
  ],
};

export default content;
