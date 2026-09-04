import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 16 — Payable Staking

### What You'll Learn

You'll learn how to receive GEN in a write method.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str
    market_questions: TreeMap[str, str]
    market_outcome_a: TreeMap[str, str]
    market_outcome_b: TreeMap[str, str]
    market_creators: TreeMap[str, Address]
    market_min_stakes: TreeMap[str, u256]
    market_statuses: TreeMap[str, str]
    market_count: u256

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."
        self.market_count = u256(0)

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.platform_name + ": " + self.platform_description

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update description"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description

    @gl.public.write
    def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
        assert len(question) > 0, "Question cannot be empty"
        assert len(outcome_a) > 0, "Outcome A cannot be empty"
        assert len(outcome_b) > 0, "Outcome B cannot be empty"
        assert outcome_a != outcome_b, "Outcomes must be different"
        assert min_stake > u256(0), "Minimum stake must be greater than zero"

        market_id = str(self.market_count)

        self.market_creators[market_id] = gl.message.sender_address
        self.market_questions[market_id] = question
        self.market_outcome_a[market_id] = outcome_a
        self.market_outcome_b[market_id] = outcome_b
        self.market_min_stakes[market_id] = min_stake
        self.market_statuses[market_id] = "active"

        self.market_count += u256(1)

        return market_id
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
