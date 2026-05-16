import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 30,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 30 — Final Capstone: Ship PredictX

### What You'll Learn

Students finalize, explain, and prepare their contract for deployment.`,
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
    market_resolution_reason: TreeMap[str, str]
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
            "winning_outcome": self.market_winning_outcome[market_id] if market_id in self.market_winning_outcome else "",
            "resolution_reason": self.market_resolution_reason[market_id] if market_id in self.market_resolution_reason else "",
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
        self.market_resolution_reason[market_id] = "Resolved manually by owner."
        self.market_statuses[market_id] = "resolved"

    @gl.public.write
    def resolve_with_ai(self, market_id: str, evidence: str) -> str:
        assert market_id in self.market_questions, "Market not found"
        assert self.market_statuses[market_id] == "closed", "Market must be closed before AI resolution"
        assert market_id not in self.market_winning_outcome, "Market already resolved"
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
            + ". Return exactly one line in this format: A|reason or B|reason."
        )

        def run():
            return gl.nondet.exec_prompt(prompt)

        def validate_result(leader_result) -> bool:
            return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0

        result = gl.vm.run_nondet_unsafe(run, validate_result).strip()
        parts = result.split("|")

        assert len(parts) == 2, "AI result must contain outcome and reason"

        winning_outcome = parts[0]
        reason = parts[1]

        assert winning_outcome == "A" or winning_outcome == "B", "AI must choose A or B"
        assert len(reason) > 0, "AI reason cannot be empty"

        self.market_winning_outcome[market_id] = winning_outcome
        self.market_resolution_reason[market_id] = reason
        self.market_statuses[market_id] = "resolved"

        return winning_outcome

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
    def get_frontend_actions_json(self) -> str:
        return json.dumps({
            "create": "create_market(question, outcome_a, outcome_b, min_stake)",
            "list": "get_active_markets_json()",
            "detail": "get_market_json(market_id)",
            "stake": "stake_on_outcome(market_id, outcome)",
            "close": "close_market(market_id)",
            "resolve": "resolve_with_ai(market_id, evidence)",
            "claim": "claim_winnings(market_id)",
        }, sort_keys=True)

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Create a market with valid outcomes",
            "Reject a market with duplicate outcomes",
            "Stake on outcome A",
            "Stake on outcome B",
            "Reject staking below minimum",
            "Close the market",
            "Resolve the market with AI evidence",
            "Allow winning users to claim",
            "Reject duplicate claims"
        ], sort_keys=True)
Final expected platform verification
{
  capstone: "PredictX",
  lesson: 30,
  finalCapstone: true,
  requiredClass: "PredictX",
  requiredImports: ["import json", "from genlayer import *"],
  requiredDecorators: [
    "@gl.public.view",
    "@gl.public.write",
    "@gl.public.write.payable"
  ],
  requiredMethods: [
    "get_platform_name",
    "get_platform_description",
    "get_owner",
    "get_contract_summary",
    "update_platform_description",
    "create_market",
    "get_market_json",
    "get_active_markets_json",
    "get_all_markets_json",
    "close_market",
    "stake_on_outcome",
    "resolve_market_manually",
    "resolve_with_ai",
    "claim_winnings",
    "get_frontend_actions_json",
    "get_test_checklist_json"
  ],
  requiredState: [
    "owner: Address",
    "market_questions: TreeMap[str, str]",
    "market_outcome_a: TreeMap[str, str]",
    "market_outcome_b: TreeMap[str, str]",
    "market_creators: TreeMap[str, Address]",
    "market_min_stakes: TreeMap[str, u256]",
    "market_statuses: TreeMap[str, str]",
    "market_ids: DynArray[str]",
    "market_count: u256",
    "market_total_a: TreeMap[str, u256]",
    "market_total_b: TreeMap[str, u256]",
    "user_stakes_a: TreeMap[str, u256]",
    "user_stakes_b: TreeMap[str, u256]",
    "market_winning_outcome: TreeMap[str, str]",
    "market_resolution_reason: TreeMap[str, str]",
    "user_claimed: TreeMap[str, bool]"
  ],
  requiredStrings: [
    "gl.message.sender_address",
    "gl.message.value",
    "json.dumps",
    "gl.nondet.exec_prompt",
    "Market already resolved",
    "Already claimed",
    "No winning stake found"
  ],
  expectedFlow: [
    "create_market returns 0",
    "get_market_json('0') includes status active",
    "stake_on_outcome rejects creator staking",
    "close_market changes status to closed",
    "resolve_with_ai changes status to resolved",
    "claim_winnings marks user_claimed true"
  ]
}
This is Track 1 fully broken down. The next batch should be Track 2: TrustLance, with the same 30-lesson depth: code, explanation, expected task, expected output, and platform checks.


Thought for 15s
`,
  task: ``,
  hints: [
    "Read the task description carefully — the change is small.",
    "Look at the expected code section for the exact pattern to follow.",
    "Check the expected code — the solution is there.",
  ],
};

export default content;
