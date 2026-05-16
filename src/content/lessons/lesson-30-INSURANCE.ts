import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 30,
  projectPath: "INSURANCE",
  explanation: `## Lesson 30 — Final Capstone: Ship CaseWise

### What You'll Learn

Students finalize the AI-assisted dispute resolution contract.

They should be able to explain:

how cases are submitted
how parties are tracked
how review fees work
how evidence references are stored
how AI review works
why AI review does not automatically close the case
how manual rulings work
how appeals work
how frontend reads case state`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    case_titles: TreeMap[str, str]
    case_claims: TreeMap[str, str]
    case_claimants: TreeMap[str, Address]
    case_respondents: TreeMap[str, Address]
    case_fees: TreeMap[str, u256]
    case_statuses: TreeMap[str, str]
    case_ids: DynArray[str]
    case_count: u256

    case_paid_amounts: TreeMap[str, u256]
    case_claimant_evidence: TreeMap[str, str]
    case_respondent_evidence: TreeMap[str, str]

    case_rulings: TreeMap[str, str]
    case_ruling_reasons: TreeMap[str, str]

    case_ai_rulings: TreeMap[str, str]
    case_ai_confidences: TreeMap[str, str]
    case_ai_reasons: TreeMap[str, str]

    case_appeal_reasons: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."
        self.case_count = u256(0)

    @gl.public.view
    def get_court_name(self) -> str:
        return self.court_name

    @gl.public.view
    def get_court_rules(self) -> str:
        return self.court_rules

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.court_name + ": " + self.court_rules

    @gl.public.write
    def update_court_rules(self, new_rules: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update rules"
        assert len(new_rules) > 0, "Rules cannot be empty"

        self.court_rules = new_rules

    @gl.public.write
    def submit_case(self, title: str, claim: str, respondent: Address, case_fee: u256) -> str:
        claimant = gl.message.sender_address

        assert len(title) > 0, "Title cannot be empty"
        assert len(claim) > 0, "Claim cannot be empty"
        assert claimant != respondent, "Claimant and respondent must be different"
        assert case_fee > u256(0), "Case fee must be greater than zero"

        case_id = str(self.case_count)

        self.case_titles[case_id] = title
        self.case_claims[case_id] = claim
        self.case_claimants[case_id] = claimant
        self.case_respondents[case_id] = respondent
        self.case_fees[case_id] = case_fee
        self.case_statuses[case_id] = "submitted"

        self.case_ids.append(case_id)
        self.case_count += u256(1)

        return case_id

    @gl.public.view
    def get_case_json(self, case_id: str) -> str:
        assert case_id in self.case_titles, "Case not found"

        return json.dumps({
            "id": case_id,
            "title": self.case_titles[case_id],
            "claim": self.case_claims[case_id],
            "claimant": self.case_claimants[case_id].as_hex,
            "respondent": self.case_respondents[case_id].as_hex,
            "case_fee": str(self.case_fees[case_id]),
            "paid_amount": str(self.case_paid_amounts[case_id]) if case_id in self.case_paid_amounts else "0",
            "claimant_evidence": self.case_claimant_evidence[case_id] if case_id in self.case_claimant_evidence else "",
            "respondent_evidence": self.case_respondent_evidence[case_id] if case_id in self.case_respondent_evidence else "",
            "ruling": self.case_rulings[case_id] if case_id in self.case_rulings else "",
            "ruling_reason": self.case_ruling_reasons[case_id] if case_id in self.case_ruling_reasons else "",
            "ai_ruling": self.case_ai_rulings[case_id] if case_id in self.case_ai_rulings else "",
            "ai_confidence": self.case_ai_confidences[case_id] if case_id in self.case_ai_confidences else "",
            "ai_reason": self.case_ai_reasons[case_id] if case_id in self.case_ai_reasons else "",
            "has_ai_review": case_id in self.case_ai_rulings,
            "appeal_reason": self.case_appeal_reasons[case_id] if case_id in self.case_appeal_reasons else "",
            "status": self.case_statuses[case_id],
        }, sort_keys=True)

    @gl.public.view
    def get_open_cases_json(self) -> str:
        result = []

        for case_id in self.case_ids:
            status = self.case_statuses[case_id]

            if status != "closed" and status != "cancelled":
                result.append({
                    "id": case_id,
                    "title": self.case_titles[case_id],
                    "claim": self.case_claims[case_id],
                    "claimant": self.case_claimants[case_id].as_hex,
                    "respondent": self.case_respondents[case_id].as_hex,
                    "case_fee": str(self.case_fees[case_id]),
                    "status": status,
                })

        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_cases_json(self) -> str:
        result = []

        for case_id in self.case_ids:
            result.append({
                "id": case_id,
                "title": self.case_titles[case_id],
                "claim": self.case_claims[case_id],
                "claimant": self.case_claimants[case_id].as_hex,
                "respondent": self.case_respondents[case_id].as_hex,
                "case_fee": str(self.case_fees[case_id]),
                "status": self.case_statuses[case_id],
            })

        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def cancel_case(self, case_id: str) -> None:
        assert case_id in self.case_titles, "Case not found"

        caller = gl.message.sender_address
        claimant = self.case_claimants[case_id]

        assert caller == claimant, "Only claimant can cancel case"
        assert self.case_statuses[case_id] == "submitted", "Only submitted cases can be cancelled"

        self.case_statuses[case_id] = "cancelled"

    @gl.public.write.payable
    def pay_case_fee(self, case_id: str) -> None:
        assert case_id in self.case_titles, "Case not found"

        caller = gl.message.sender_address
        claimant = self.case_claimants[case_id]

        assert caller == claimant, "Only claimant can pay case fee"
        assert self.case_statuses[case_id] == "submitted", "Only submitted cases can be paid"
        assert gl.message.value >= self.case_fees[case_id], "Payment is below case fee"

        self.case_paid_amounts[case_id] = gl.message.value
        self.case_statuses[case_id] = "reviewing"

    @gl.public.write
    def add_evidence(self, case_id: str, evidence_ref: str) -> None:
        assert case_id in self.case_titles, "Case not found"
        assert len(evidence_ref) > 0, "Evidence reference cannot be empty"
        assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing to add evidence"

        caller = gl.message.sender_address
        claimant = self.case_claimants[case_id]
        respondent = self.case_respondents[case_id]

        assert caller == claimant or caller == respondent, "Only case parties can add evidence"

        if caller == claimant:
            self.case_claimant_evidence[case_id] = evidence_ref
        else:
            self.case_respondent_evidence[case_id] = evidence_ref

    @gl.public.write
    def rule_case_manually(self, case_id: str, ruling: str, reason: str) -> None:
        assert case_id in self.case_titles, "Case not found"
        assert gl.message.sender_address == self.owner, "Only owner can rule cases"
        assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing before ruling"
        assert (
            ruling == "CLAIMANT_WINS"
            or ruling == "RESPONDENT_WINS"
            or ruling == "SPLIT"
        ), "Invalid ruling"
        assert len(reason) > 0, "Ruling reason cannot be empty"

        self.case_rulings[case_id] = ruling
        self.case_ruling_reasons[case_id] = reason
        self.case_statuses[case_id] = "ruled"

    @gl.public.view
    def get_case_review_prompt(self, case_id: str) -> str:
        assert case_id in self.case_titles, "Case not found"

        return (
            "Review this dispute case. "
            + "Title: "
            + self.case_titles[case_id]
            + ". Claim: "
            + self.case_claims[case_id]
            + ". Claimant evidence: "
            + (self.case_claimant_evidence[case_id] if case_id in self.case_claimant_evidence else "")
            + ". Respondent evidence: "
            + (self.case_respondent_evidence[case_id] if case_id in self.case_respondent_evidence else "")
            + ". Recommend a ruling and explain why."
        )

    @gl.public.write
    def review_case_with_ai(self, case_id: str) -> str:
        assert case_id in self.case_titles, "Case not found"
        assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing before AI review"
        assert case_id not in self.case_ai_rulings, "Case already reviewed by AI"

        prompt = (
            "You are reviewing a dispute case. "
            + "Title: "
            + self.case_titles[case_id]
            + ". Claim: "
            + self.case_claims[case_id]
            + ". Claimant evidence: "
            + (self.case_claimant_evidence[case_id] if case_id in self.case_claimant_evidence else "")
            + ". Respondent evidence: "
            + (self.case_respondent_evidence[case_id] if case_id in self.case_respondent_evidence else "")
            + ". Return exactly one line in this format: "
            + "CLAIMANT_WINS|LOW|reason, CLAIMANT_WINS|MEDIUM|reason, CLAIMANT_WINS|HIGH|reason, "
            + "RESPONDENT_WINS|LOW|reason, RESPONDENT_WINS|MEDIUM|reason, RESPONDENT_WINS|HIGH|reason, "
            + "SPLIT|LOW|reason, SPLIT|MEDIUM|reason, SPLIT|HIGH|reason, "
            + "or NEEDS_MORE_INFO|LOW|reason, NEEDS_MORE_INFO|MEDIUM|reason, NEEDS_MORE_INFO|HIGH|reason."
        )

        def run():
            return gl.nondet.exec_prompt(prompt)

        def validate_result(leader_result) -> bool:
            return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0

        result = gl.vm.run_nondet_unsafe(run, validate_result).strip()
        parts = result.split("|")

        assert len(parts) == 3, "AI result must contain ruling, confidence, and reason"

        ruling = parts[0]
        confidence = parts[1]
        reason = parts[2]

        assert (
            ruling == "CLAIMANT_WINS"
            or ruling == "RESPONDENT_WINS"
            or ruling == "SPLIT"
            or ruling == "NEEDS_MORE_INFO"
        ), "Invalid AI ruling"

        assert confidence == "LOW" or confidence == "MEDIUM" or confidence == "HIGH", "Invalid AI confidence"
        assert len(reason) > 0, "AI reason cannot be empty"

        self.case_ai_rulings[case_id] = ruling
        self.case_ai_confidences[case_id] = confidence
        self.case_ai_reasons[case_id] = reason

        return ruling

    @gl.public.view
    def get_dispute_rules_json(self) -> str:
        return json.dumps([
            "Only the claimant can pay the case fee",
            "Only case parties can add evidence",
            "Cases must be reviewing before AI review",
            "AI review does not automatically close the case",
            "Only the owner/arbitrator can finalize a ruling",
            "Appeals can only happen after a ruling"
        ], sort_keys=True)

    @gl.public.write
    def appeal_case(self, case_id: str, appeal_reason: str) -> None:
        assert case_id in self.case_titles, "Case not found"
        assert self.case_statuses[case_id] == "ruled", "Only ruled cases can be appealed"
        assert len(appeal_reason) > 0, "Appeal reason cannot be empty"

        caller = gl.message.sender_address
        claimant = self.case_claimants[case_id]
        respondent = self.case_respondents[case_id]

        assert caller == claimant or caller == respondent, "Only case parties can appeal"

        self.case_appeal_reasons[case_id] = appeal_reason
        self.case_statuses[case_id] = "appealed"

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Submit a case with title, claim, respondent, and fee",
            "Reject a case with an empty claim",
            "Reject a case where claimant and respondent are the same",
            "Pay the case fee as claimant",
            "Reject fee payment from non-claimant",
            "Add claimant evidence",
            "Add respondent evidence",
            "Reject evidence from a non-party",
            "Run AI case review",
            "Verify AI ruling, confidence, and reason are stored",
            "Manually rule the case as owner",
            "Appeal the ruled case as a party",
            "Reject appeal from non-party"
        ], sort_keys=True)
`,
  task: `Deploy the final CaseWise contract and verify the complete AI-assisted dispute flow.

Before marking the capstone complete, confirm the contract can:

- return identity data with get_court_name, get_court_rules, get_owner, and get_contract_summary
- submit cases with claimant/respondent tracking and case_ids indexing
- expose case detail, open-case, and all-case JSON views
- accept the claimant's case fee through @gl.public.write.payable and gl.message.value
- accept evidence only from the claimant or respondent
- run AI review with gl.vm.run_nondet_unsafe and store ruling, confidence, and reason
- let the owner finalize a manual ruling
- let case parties appeal after a ruling
- expose dispute rules and a test checklist

After deployment, call get_court_name(), get_all_cases_json(), and get_test_checklist_json() to prove the contract is reachable and frontend-ready.`,
  hints: [
    "Use the final starter as the deployable CaseWise contract; this lesson is about validation, not adding a new feature.",
    "Test the lifecycle in order: submit, pay fee, add evidence, review with AI, rule, appeal.",
    "Key views to call after deploy: get_court_name(), get_dispute_rules_json(), and get_test_checklist_json().",
  ],
};

export default content;
