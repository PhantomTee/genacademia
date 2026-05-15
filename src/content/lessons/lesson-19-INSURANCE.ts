import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 19,
  projectPath: "INSURANCE",
  explanation: `## Lesson 19 — Ruling and Refund Patterns

### What You'll Learn

Students learn how to record a manual ruling and close a case.

This lesson does not use AI yet. It teaches deterministic ruling logic first.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

case_rulings: TreeMap[str, str]
case_ruling_reasons: TreeMap[str, str]
Add:

rule_case_manually(case_id: str, ruling: str, reason: str)
Rules:

Only owner can rule manually.
Case must be reviewing.
Ruling must be CLAIMANT_WINS or RESPONDENT_WINS or SPLIT.
Reason cannot be empty.
Status becomes ruled.
Expected code additions
case_rulings: TreeMap[str, str]
case_ruling_reasons: TreeMap[str, str]
Method:

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
    self.case_statuses[case_id] = "ruled"`,
  hints: [
    "Add:.",
    "case_rulings: TreeMap[str, str]",
    "Key line: `After manual ruling:`",
  ],
};

export default content;
