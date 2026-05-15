import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 16 — @gl.public.write.payable: Accepting GEN

To receive native GEN tokens, use \`@gl.public.write.payable\` instead of \`@gl.public.write\`. The amount sent is available as \`gl.message.value\` (a \`u256\`).

\`\`\`python
@gl.public.write.payable
def stake_on_outcome(self, market_id: str, outcome: str) -> None:
    assert gl.message.value >= self.market_min_stakes[market_id], "Stake is below minimum"
\`\`\`

Two new fields track the total GEN staked per outcome:

\`\`\`python
market_total_a: TreeMap[str, u256]
market_total_b: TreeMap[str, u256]
\`\`\`

Because \`TreeMap\` entries don't auto-initialize, you must check before adding:

\`\`\`python
if market_id not in self.market_total_a:
    self.market_total_a[market_id] = u256(0)
self.market_total_a[market_id] += gl.message.value
\`\`\`

Use this same initialize-then-increment pattern any time you accumulate into a \`TreeMap\`.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
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
    market_ids: DynArray[str]

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
        self.market_ids.append(market_id)

        return market_id

    @gl.public.view
    def get_market_json(self, market_id: str) -> str:
        assert market_id in self.market_questions, "Market not found"
        return json.dumps({
            "id": market_id,
            "creator": self.market_creators[market_id].as_hex,
            "question": self.market_questions[market_id],
            "outcome_a": self.market_outcome_a[market_id],
            "outcome_b": self.market_outcome_b[market_id],
            "min_stake": str(self.market_min_stakes[market_id]),
            "status": self.market_statuses[market_id],
        }, sort_keys=True)

    @gl.public.view
    def get_active_markets_json(self) -> str:
        result = []
        for market_id in self.market_ids:
            if self.market_statuses[market_id] == "active":
                result.append({
                    "id": market_id,
                    "creator": self.market_creators[market_id].as_hex,
                    "question": self.market_questions[market_id],
                    "outcome_a": self.market_outcome_a[market_id],
                    "outcome_b": self.market_outcome_b[market_id],
                    "min_stake": str(self.market_min_stakes[market_id]),
                    "status": self.market_statuses[market_id],
                })
        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_markets_json(self) -> str:
        result = []
        for market_id in self.market_ids:
            result.append({
                "id": market_id,
                "creator": self.market_creators[market_id].as_hex,
                "question": self.market_questions[market_id],
                "outcome_a": self.market_outcome_a[market_id],
                "outcome_b": self.market_outcome_b[market_id],
                "min_stake": str(self.market_min_stakes[market_id]),
                "status": self.market_statuses[market_id],
            })
        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def close_market(self, market_id: str) -> None:
        assert market_id in self.market_questions, "Market not found"
        caller = gl.message.sender_address
        creator = self.market_creators[market_id]
        assert caller == creator or caller == self.owner, "Only creator or owner can close market"
        assert self.market_statuses[market_id] == "active", "Market is not active"
        self.market_statuses[market_id] = "closed"
`,
  task: "Add `market_total_a: TreeMap[str, u256]` and `market_total_b: TreeMap[str, u256]` as fields. Add `stake_on_outcome(self, market_id: str, outcome: str) -> None` with `@gl.public.write.payable`. Validate the market exists, is active, and the sent value meets the minimum stake. Then add the value to the correct total based on outcome `\"A\"` or `\"B\"`, raising an error for invalid outcomes.",
  hints: [
    "Use `@gl.public.write.payable` (not `@gl.public.write`) to receive GEN.",
    "Check: `assert gl.message.value >= self.market_min_stakes[market_id], \"Stake is below minimum\"`",
    "Initialize totals: `if market_id not in self.market_total_a: self.market_total_a[market_id] = u256(0)` before adding.",
  ],
};

export default content;
