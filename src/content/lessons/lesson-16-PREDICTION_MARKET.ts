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
  expectedCode: `market_total_a: TreeMap[str, u256]
market_total_b: TreeMap[str, u256]
Method:

@gl.public.write.payable
def stake_on_outcome(self, market_id: str, outcome: str) -> None:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "active", "Market is not active"
    assert gl.message.value >= self.market_min_stakes[market_id], "Stake is below minimum"

    if market_id not in self.market_total_a:
        self.market_total_a[market_id] = u256(0)

    if market_id not in self.market_total_b:
        self.market_total_b[market_id] = u256(0)

    if outcome == "A":
        self.market_total_a[market_id] += gl.message.value
    elif outcome == "B":
        self.market_total_b[market_id] += gl.message.value
    else:
        assert False, "Invalid outcome"
If user stakes on "A" with enough GEN:

market_total_a increases
Invalid outcome "C" fails:

Invalid outcome
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
