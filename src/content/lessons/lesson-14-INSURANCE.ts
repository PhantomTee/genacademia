import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 14,
  projectPath: "INSURANCE",
  explanation: `## Lesson 14 — Case Status Flow

### What You'll Learn

Students learn the CaseWise status machine:

submitted → reviewing → ruled → closed
submitted → cancelled
ruled → appealed
appealed → closed
This lesson adds cancellation.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.write
def cancel_case(self, case_id: str) -> None:
    assert case_id in self.case_titles, "Case not found"

    caller = gl.message.sender_address
    claimant = self.case_claimants[case_id]

    assert caller == claimant, "Only claimant can cancel case"
    assert self.case_statuses[case_id] == "submitted", "Only submitted cases can be cancelled"

    self.case_statuses[case_id] = "cancelled"
Before:

submitted
After:

cancelled
Wrong caller fails with:

Only claimant can cancel case
`,
  task: `Add:

cancel_case(case_id: str)
Rules:

Case must exist.
Only claimant can cancel.
Only submitted cases can be cancelled.
Status becomes cancelled.`,
  hints: [
    "Add:.",
    "cancel_case(case_id: str)",
    "Key line: `def cancel_case(self, case_id: str) -> None:`",
  ],
};

export default content;
