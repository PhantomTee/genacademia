import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "INSURANCE",
  explanation: `## Lesson 9 — Case Records with TreeMap

### What You'll Learn

Students learn validation for dispute case creation.

A case should not have:

empty title
empty claim
same claimant and respondent
zero fee`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add validation to submit_case.

Expected method
@gl.public.write
def submit_case(self, title: str, claim: str, respondent: Address, case_fee: u256) -> str:
    claimant = gl.message.sender_address

    assert len(title) > 0, "Title cannot be empty"
    assert len(claim) > 0, "Claim cannot be empty"
    assert claimant != respondent, "Claimant and respondent must be different"
    assert case_fee > u256(0), "Case fee must be greater than zero"

    case_id = "0"

    self.case_titles[case_id] = title
    self.case_claims[case_id] = claim
    self.case_claimants[case_id] = claimant
    self.case_respondents[case_id] = respondent
    self.case_fees[case_id] = case_fee
    self.case_statuses[case_id] = "submitted"

    return case_id`,
  hints: [
    "Add validation to submit_case.",
    "Expected method",
    "Key line: `Empty title fails with:`",
  ],
};

export default content;
