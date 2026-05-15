import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "INSURANCE",
  explanation: `## Lesson 16 — Paying Review Fees

### What You'll Learn

Students learn how to accept a payable review fee.

A submitted case becomes reviewing only after the claimant pays the fee.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `After payment:

status = reviewing
Low payment fails with:

Payment is below case fee
`,
  task: `Add:

case_paid_amounts: TreeMap[str, u256]
Add:

pay_case_fee(case_id: str)
Rules:

Case must exist.
Only claimant can pay.
Case must be submitted.
Payment must be at least required case fee.
Status becomes reviewing.
Expected code additions
case_paid_amounts: TreeMap[str, u256]
Method:

@gl.public.write.payable
def pay_case_fee(self, case_id: str) -> None:
    assert case_id in self.case_titles, "Case not found"

    caller = gl.message.sender_address
    claimant = self.case_claimants[case_id]

    assert caller == claimant, "Only claimant can pay case fee"
    assert self.case_statuses[case_id] == "submitted", "Only submitted cases can be paid"
    assert gl.message.value >= self.case_fees[case_id], "Payment is below case fee"

    self.case_paid_amounts[case_id] = gl.message.value
    self.case_statuses[case_id] = "reviewing"`,
  hints: [
    "Add:.",
    "case_paid_amounts: TreeMap[str, u256]",
    "Key line: `After payment:`",
  ],
};

export default content;
