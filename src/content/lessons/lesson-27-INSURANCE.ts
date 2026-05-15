import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 27,
  projectPath: "INSURANCE",
  explanation: `## Lesson 27 — Appeal Logic

### What You'll Learn

Students learn how appeals extend a dispute system.

Appeals should only happen after a case is ruled.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `After appeal:

{
  "status": "appealed",
  "appeal_reason": "The ruling ignored my submitted evidence."
}
Wrong caller fails with:

Only case parties can appeal
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
Status becomes appealed.
Expected code additions
case_appeal_reasons: TreeMap[str, str]
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
    self.case_statuses[case_id] = "appealed"`,
  hints: [
    "Add:.",
    "case_appeal_reasons: TreeMap[str, str]",
    "Key line: `After appeal:`",
  ],
};

export default content;
