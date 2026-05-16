import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 23,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 23 — Comparative Validation

### What You'll Learn

You'll learn that AI output should not be blindly trusted. Validators need a way to compare whether answers are equivalent.`,
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
  task: `Update the prompt so it asks for a stricter format.

Instead of returning only A or B, the AI should return:

A|short reason
or:

B|short reason
Expected code change
prompt = (
    "You are resolving a prediction market. "
    + "Question: "
    + self.market_questions[market_id]
    + ". Outcome A: "
    + self.market_outcome_a[market_id]
    + ". Outcome B: "
    + self.market_outcome_b[market_id]
    + ". Evidence: "
    + evidence
    + ". Return exactly one line in this format: A|reason or B|reason."
)
Then:

result = gl.vm.run_nondet_unsafe(run, validate_result)
parts = result.split("|")

assert len(parts) == 2, "AI result must contain outcome and reason"

winning_outcome = parts[0]
reason = parts[1]

assert winning_outcome == "A" or winning_outcome == "B", "AI must choose A or B"`,
  hints: [
    "Update the prompt so it asks for a stricter format.",
    "Instead of returning only A or B, the AI should return:",
    "Check the expected code — the solution is there.",
  ],
};

export default content;
