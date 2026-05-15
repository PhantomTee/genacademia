import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 9 — Market Records with TreeMap

### What You'll Learn

You'll learn how one logical record can be split across multiple TreeMap fields.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

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
`,
  expectedCode: `@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
    assert len(question) > 0, "Question cannot be empty"
    assert len(outcome_a) > 0, "Outcome A cannot be empty"
    assert len(outcome_b) > 0, "Outcome B cannot be empty"
    assert outcome_a != outcome_b, "Outcomes must be different"
    assert min_stake > u256(0), "Minimum stake must be greater than zero"

    market_id = "0"
    self.market_creators[market_id] = gl.message.sender_address
    self.market_questions[market_id] = question
    self.market_outcome_a[market_id] = outcome_a
    self.market_outcome_b[market_id] = outcome_b
    self.market_min_stakes[market_id] = min_stake
    self.market_statuses[market_id] = "active"

    return market_id
`,
  task: `Add validation for market creation:

Question cannot be empty.
Outcome A cannot be empty.
Outcome B cannot be empty.
Outcome A and B cannot be the same.`,
  hints: [
    "Add validation for market creation:.",
    "Question cannot be empty.",
    "Key line: `def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:`",
  ],
};

export default content;
