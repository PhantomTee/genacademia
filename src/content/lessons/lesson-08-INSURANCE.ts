import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 8,
  projectPath: "INSURANCE",
  explanation: `## Lesson 8 — Case Fees with u256

### What You'll Learn

Students learn how to add dispute review fees.

A real dispute system may require a review fee or bond to reduce spam.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `Valid case fee returns:

0
Zero fee fails with:

Case fee must be greater than zero
`,
  task: `Add:

case_fees: TreeMap[str, u256]
Update submit_case to accept:

case_fee: u256
Validate:

assert case_fee > u256(0), "Case fee must be greater than zero"
Expected code additions
case_fees: TreeMap[str, u256]
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

    return case_id`,
  hints: [
    "Add:.",
    "case_fees: TreeMap[str, u256]",
    "Key line: `Valid case fee returns:`",
  ],
};

export default content;
