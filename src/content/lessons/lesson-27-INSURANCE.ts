import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 27,
  projectPath: "INSURANCE",
  explanation: `## Lesson 27 — Appeal Logic

### What You'll Learn

You'll learn how appeals extend a dispute system.

Appeals should only happen after a case is ruled.`,
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
  expectedCode: `case_appeal_reasons: TreeMap[str, str]
Method:

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
`,
  task: `Add:

case_appeal_reasons: TreeMap[str, str]
Add:

appeal_case(case_id: str, appeal_reason: str)
Rules:

Case must exist.
Only claimant or respondent can appeal.
Case must be ruled.
Appeal reason cannot be empty.
Status becomes appealed.`,
  hints: [
    "Add:.",
    "case_appeal_reasons: TreeMap[str, str]",
    "Key line: `def appeal_case(self, case_id: str, appeal_reason: str) -> None:`",
  ],
};

export default content;
