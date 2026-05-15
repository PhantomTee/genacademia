import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 22 — Calling AI with gl.nondet.exec_prompt

\`gl.nondet.exec_prompt(prompt)\` calls an LLM and returns its response as a string. This is non-deterministic — different validators may get slightly different responses — but GenLayer's Optimistic Simulator reaches consensus on whether the responses are equivalent.

For binary decisions like \`"A"\` or \`"B"\`, the prompt must be very precise. End it with \`". Return only A or B."\` to force a clean single-character answer. After the call, always assert the result is valid before storing it.

**Pattern:**
\`\`\`python
@gl.public.write
def resolve_with_ai(self, market_id: str, evidence: str) -> str:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "closed", "Market must be closed before AI resolution"
    assert len(evidence) > 0, "Evidence cannot be empty"
    prompt = (
        "You are resolving a prediction market. "
        + "Question: " + self.market_questions[market_id]
        + ". Outcome A: " + self.market_outcome_a[market_id]
        + ". Outcome B: " + self.market_outcome_b[market_id]
        + ". Evidence: " + evidence
        + ". Return only A or B."
    )
    result = gl.nondet.exec_prompt(prompt)
    assert result == "A" or result == "B", "AI must return A or B"
    self.market_winning_outcome[market_id] = result
    self.market_statuses[market_id] = "resolved"
    return result
\`\`\`

The \`@gl.public.write\` decorator (not \`.view\`) is required because you are writing state — storing the winning outcome and updating the market status.`,
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
    market_ids: DynArray[str]
    market_count: u256

    market_total_a: TreeMap[str, u256]
    market_total_b: TreeMap[str, u256]
    user_stakes_a: TreeMap[str, u256]
    user_stakes_b: TreeMap[str, u256]

    market_winning_outcome: TreeMap[str, str]
    user_claimed: TreeMap[str, bool]

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
        self.market_ids.append(market_id)
        self.market_count += u256(1)
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
        assert self.market_statuses[market_id] == "active", "Only active markets can be closed"
        self.market_statuses[market_id] = "closed"

    @gl.public.write.payable
    def stake_on_outcome(self, market_id: str, outcome: str) -> None:
        assert market_id in self.market_questions, "Market not found"
        assert self.market_statuses[market_id] == "active", "Market is not active"
        assert gl.message.sender_address != self.market_creators[market_id], "Creator cannot stake on own market"
        assert gl.message.value >= self.market_min_stakes[market_id], "Stake is below minimum"
        if market_id not in self.market_total_a:
            self.market_total_a[market_id] = u256(0)
        if market_id not in self.market_total_b:
            self.market_total_b[market_id] = u256(0)
        stake_key = market_id + "_" + gl.message.sender_address.as_hex
        if outcome == "A":
            if stake_key not in self.user_stakes_a:
                self.user_stakes_a[stake_key] = u256(0)
            self.user_stakes_a[stake_key] += gl.message.value
            self.market_total_a[market_id] += gl.message.value
        elif outcome == "B":
            if stake_key not in self.user_stakes_b:
                self.user_stakes_b[stake_key] = u256(0)
            self.user_stakes_b[stake_key] += gl.message.value
            self.market_total_b[market_id] += gl.message.value
        else:
            assert False, "Invalid outcome"

    @gl.public.write
    def resolve_market_manually(self, market_id: str, winning_outcome: str) -> None:
        assert market_id in self.market_questions, "Market not found"
        assert gl.message.sender_address == self.owner, "Only owner can resolve manually"
        assert self.market_statuses[market_id] == "closed", "Market must be closed before resolution"
        assert winning_outcome == "A" or winning_outcome == "B", "Invalid winning outcome"
        self.market_winning_outcome[market_id] = winning_outcome
        self.market_statuses[market_id] = "resolved"

    @gl.public.write
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

    @gl.public.view
    def get_resolution_prompt(self, market_id: str, evidence: str) -> str:
        assert market_id in self.market_questions, "Market not found"
        return (
            "Resolve this prediction market using the evidence provided. Question: "
            + self.market_questions[market_id]
            + " Outcome A: " + self.market_outcome_a[market_id]
            + " Outcome B: " + self.market_outcome_b[market_id]
            + " Evidence: " + evidence
        )

    # TODO: Add resolve_with_ai(self, market_id: str, evidence: str) -> str here
`,
  task:
    'Add `@gl.public.write` method `resolve_with_ai(self, market_id: str, evidence: str) -> str`. Validate the market is closed and evidence is non-empty. Build a prompt ending with `". Return only A or B."`, call `gl.nondet.exec_prompt(prompt)`, assert the result is `"A"` or `"B"`, store it as the winning outcome, set status to `"resolved"`, and return the result.',
  hints: [
    'End the prompt with: `". Return only A or B."`',
    "Call: `result = gl.nondet.exec_prompt(prompt)`",
    'Assert: `assert result == "A" or result == "B", "AI must return A or B"`',
  ],
};

export default content;
