import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 9 — \`TreeMap[str, T]\`: Input Validation for Record Creation

When creating on-chain records, validate **all inputs before writing anything**. If any assert fails, the entire transaction reverts — no partial writes occur. This is the fundamental safety guarantee of assert-first patterns.

### Four validation rules for \`create_market\`

1. **Question cannot be empty** — a market with no question is meaningless.
2. **Outcome A cannot be empty** — both outcomes must be labelled.
3. **Outcome B cannot be empty** — same reason.
4. **Outcomes must be different** — a market where both outcomes are identical cannot resolve.

\`\`\`python
assert len(question) > 0, "Question cannot be empty"
assert len(outcome_a) > 0, "Outcome A cannot be empty"
assert len(outcome_b) > 0, "Outcome B cannot be empty"
assert outcome_a != outcome_b, "Outcomes must be different"
\`\`\`

### Placement matters

All four asserts must come **before** the \`market_id = "0"\` line and any \`self.market_...\` assignments. If validation happens after partial writes, a failed assert would still revert everything — but the ordering makes the code unambiguous about intent and is much easier to audit.

\`\`\`python
@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
    # 1. Validate ALL inputs first
    assert len(question) > 0, "Question cannot be empty"
    assert len(outcome_a) > 0, "Outcome A cannot be empty"
    assert len(outcome_b) > 0, "Outcome B cannot be empty"
    assert outcome_a != outcome_b, "Outcomes must be different"
    assert min_stake > u256(0), "Minimum stake must be greater than zero"
    # 2. Then write state
    market_id = "0"
    ...
\`\`\``,
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
    market_statuses: TreeMap[str, str]
    market_min_stakes: TreeMap[str, u256]
    market_count: u256

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

    @gl.public.write
    def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
        assert min_stake > u256(0), "Minimum stake must be greater than zero"
        market_id = "0"
        self.market_creators[market_id] = gl.message.sender_address
        self.market_questions[market_id] = question
        self.market_outcome_a[market_id] = outcome_a
        self.market_outcome_b[market_id] = outcome_b
        self.market_statuses[market_id] = "active"
        self.market_min_stakes[market_id] = min_stake
        return market_id
`,
  task: "Add four assert statements at the start of `create_market`, before any state writes: validate question is non-empty, outcome_a is non-empty, outcome_b is non-empty, and outcome_a is not equal to outcome_b.",
  hints: [
    "Use `assert len(question) > 0, \"Question cannot be empty\"` for string length checks.",
    "The inequality check is: `assert outcome_a != outcome_b, \"Outcomes must be different\"`",
    "All four asserts must come BEFORE `market_id = \"0\"` and any `self.market_...` assignments.",
  ],
};

export default content;
