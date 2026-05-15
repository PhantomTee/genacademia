import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 8,
  projectPath: "INSURANCE",
  explanation: `## Lesson 8 — Case Fees with u256

### What You'll Learn

You'll learn how to add dispute review fees.

A real dispute system may require a review fee or bond to reduce spam.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."

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
`,
  expectedCode: `case_fees: TreeMap[str, u256]
Updated method:

@gl.public.write
def submit_case(self, title: str, claim: str, respondent: Address, case_fee: u256) -> str:
    assert case_fee > u256(0), "Case fee must be greater than zero"

    case_id = "0"

    self.case_titles[case_id] = title
    self.case_claims[case_id] = claim
    self.case_claimants[case_id] = gl.message.sender_address
    self.case_respondents[case_id] = respondent
    self.case_fees[case_id] = case_fee
    self.case_statuses[case_id] = "submitted"

    return case_id
`,
  task: `Add:

case_fees: TreeMap[str, u256]
Update submit_case to accept:

case_fee: u256
Validate:

assert case_fee > u256(0), "Case fee must be greater than zero"`,
  hints: [
    "Add:.",
    "case_fees: TreeMap[str, u256]",
    "Key line: `def submit_case(self, title: str, claim: str, respondent: Address, case_fee: u256) -> str:`",
  ],
};

export default content;
