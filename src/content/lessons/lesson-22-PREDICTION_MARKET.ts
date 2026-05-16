import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 22 — Using gl.nondet.exec_prompt

### What You'll Learn

You'll learn how to request AI analysis.`,
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
  expectedCode: `@gl.public.write
def resolve_with_ai(self, market_id: str, evidence: str) -> str:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "closed", "Market must be closed before AI resolution"
    assert len(evidence) > 0, "Evidence cannot be empty"

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
        + ". Return only A or B."
    )

    def run():
        return gl.nondet.exec_prompt(prompt)

    def validate_result(leader_result) -> bool:
        return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0

    result = gl.vm.run_nondet_unsafe(run, validate_result).strip()

    assert result == "A" or result == "B", "AI must return A or B"

    self.market_winning_outcome[market_id] = result
    self.market_statuses[market_id] = "resolved"

    return result
`,
  task: `Add:

resolve_with_ai(market_id: str, evidence: str)
The method should call:

gl.nondet.exec_prompt(prompt)`,
  hints: [
    "Add:.",
    "resolve_with_ai(market_id: str, evidence: str)",
    "Key line: `def resolve_with_ai(self, market_id: str, evidence: str) -> str:`",
  ],
};

export default content;
