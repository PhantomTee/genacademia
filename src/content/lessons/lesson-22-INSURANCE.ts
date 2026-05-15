import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "INSURANCE",
  explanation: `## Lesson 22 — AI Case Review

### What You'll Learn

Students learn how to call AI with:

gl.nondet.exec_prompt(prompt)`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.write
def review_case_with_ai(self, case_id: str) -> str:
    assert case_id in self.case_titles, "Case not found"
    assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing before AI review"

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
        + ". Return only CLAIMANT_WINS, RESPONDENT_WINS, SPLIT, or NEEDS_MORE_INFO."
    )

    result = gl.nondet.exec_prompt(prompt)

    assert (
        result == "CLAIMANT_WINS"
        or result == "RESPONDENT_WINS"
        or result == "SPLIT"
        or result == "NEEDS_MORE_INFO"
    ), "Invalid AI case result"

    return result
AI returns:

CLAIMANT_WINS
or one of the allowed values.

Invalid output fails with:

Invalid AI case result
`,
  task: `Add:

review_case_with_ai(case_id: str) -> str
The AI should return one of:

CLAIMANT_WINS
RESPONDENT_WINS
SPLIT
NEEDS_MORE_INFO`,
  hints: [
    "Add:.",
    "review_case_with_ai(case_id: str) -> str",
    "Key line: `def review_case_with_ai(self, case_id: str) -> str:`",
  ],
};

export default content;
