import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 20 — Group 4 Capstone: Claim Winnings

This is the Group 4 capstone. \`claim_winnings\` closes the loop on the staking lifecycle — it lets winners mark themselves as having claimed, enforcing three rules:

1. **Market is resolved**: only resolved markets can be claimed against
2. **Not already claimed**: use the composite claim key to check \`user_claimed\`
3. **Caller staked on the winning side**: check \`user_stakes_a\` or \`user_stakes_b\`

The claim key follows the same pattern as the stake key:

\`\`\`python
claim_key = market_id + "_" + gl.message.sender_address.as_hex
\`\`\`

Already-claimed check:

\`\`\`python
if claim_key in self.user_claimed:
    assert self.user_claimed[claim_key] == False, "Already claimed"
\`\`\`

Winning-stake check:

\`\`\`python
winning_outcome = self.market_winning_outcome[market_id]
if winning_outcome == "A":
    assert claim_key in self.user_stakes_a, "No winning stake found"
else:
    assert claim_key in self.user_stakes_b, "No winning stake found"
\`\`\`

Finally: \`self.user_claimed[claim_key] = True\`

Note: actual GEN transfer/payout is advanced content — this lesson focuses on the state machine for claiming. The full payout logic builds on this foundation.`,
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

    @gl.public.write.payable
    def stake_on_outcome(self, market_id: str, outcome: str) -> None:
        assert market_id in self.market_questions, "Market not found"
        assert self.market_statuses[market_id] == "active", "Market is not active"
        assert gl.message.sender_address != self.market_creators[market_id], "Creator cannot stake on own market"
        assert gl.message.value >= self.market_min_stakes[market_id], "Stake is below minimum"
        stake_key = market_id + "_" + gl.message.sender_address.as_hex
        if outcome == "A":
            if market_id not in self.market_total_a:
                self.market_total_a[market_id] = u256(0)
            self.market_total_a[market_id] += gl.message.value
            if stake_key not in self.user_stakes_a:
                self.user_stakes_a[stake_key] = u256(0)
            self.user_stakes_a[stake_key] += gl.message.value
        elif outcome == "B":
            if market_id not in self.market_total_b:
                self.market_total_b[market_id] = u256(0)
            self.market_total_b[market_id] += gl.message.value
            if stake_key not in self.user_stakes_b:
                self.user_stakes_b[stake_key] = u256(0)
            self.user_stakes_b[stake_key] += gl.message.value
        else:
            assert False, "Invalid outcome: must be A or B"

    @gl.public.write
    def resolve_market_manually(self, market_id: str, winning_outcome: str) -> None:
        assert market_id in self.market_questions, "Market not found"
        assert gl.message.sender_address == self.owner, "Only owner can resolve market"
        assert self.market_statuses[market_id] == "closed", "Market must be closed before resolution"
        assert winning_outcome == "A" or winning_outcome == "B", "Invalid winning outcome"
        self.market_winning_outcome[market_id] = winning_outcome
        self.market_statuses[market_id] = "resolved"
`,
  task: "Add `claim_winnings(self, market_id: str) -> None` with `@gl.public.write`. It must: assert market exists, assert status is `\"resolved\"`, build the claim key, assert not already claimed, check the caller staked on the winning side, then mark as claimed.",
  hints: [
    "Build the key: `claim_key = market_id + \"_\" + gl.message.sender_address.as_hex`",
    "Already-claimed check: `if claim_key in self.user_claimed: assert self.user_claimed[claim_key] == False, \"Already claimed\"`",
    "For winning side check: `if winning_outcome == \"A\": assert claim_key in self.user_stakes_a, \"No winning stake found\"`",
  ],
};

export default content;
