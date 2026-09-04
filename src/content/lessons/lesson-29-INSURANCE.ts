import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 29,
  projectPath: "INSURANCE",
  explanation: `## Lesson 29 — Capstone Assembly

### What You'll Learn

You'll assemble the full CaseWise contract and verify that every module from the previous lessons is present before the final deploy.

By the end of this step, your contract should include identity views, case submission, case indexing, JSON views, fee payment, evidence submission, manual rulings, AI review, appeal logic, dispute rules, and a test checklist.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

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
    case_count: u256

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

        self.case_count += u256(1)

        return case_id
`,
  task: `Review your CaseWise contract and assemble the full capstone surface.

Make sure the contract includes:

- identity views: get_court_name, get_court_rules, get_owner, get_contract_summary
- case creation: submit_case with title, claim, respondent, fee, claimant capture, and case_ids indexing
- case reads: get_case_json, get_open_cases_json, get_all_cases_json
- payment flow: pay_case_fee using @gl.public.write.payable and gl.message.value
- evidence flow: add_evidence with claimant/respondent authorization
- ruling flow: rule_case_manually and review_case_with_ai
- appeal flow: appeal_case
- helper views: get_dispute_rules_json and get_test_checklist_json

Do not deploy yet. This lesson is the final assembly pass: fill any missing methods or state fields so Lesson 30 is only about deployment and verification.`,
  hints: [
    "Use the Lesson 30 CaseWise starter as your reference for the complete method list.",
    "A complete capstone should include both AI review and manual owner ruling; AI review stores a recommendation but does not close the case.",
    "Key methods to confirm: submit_case, pay_case_fee, add_evidence, review_case_with_ai, rule_case_manually, appeal_case.",
  ],
};

export default content;
