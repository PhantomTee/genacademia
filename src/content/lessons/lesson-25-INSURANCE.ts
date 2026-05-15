import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 25,
  projectPath: "INSURANCE",
  explanation: `## Lesson 25 — Major Upgrade: AI Arbitration Engine

### What You'll Learn

Students combine:

case state
party evidence
AI review
structured ruling
confidence
reason storage
This makes CaseWise a true Intelligent Contract.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.write
def review_case_with_ai(self, case_id: str) -> str:
    assert case_id in self.case_titles, "Case not found"
    assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing before AI review"
    assert case_id not in self.case_ai_rulings, "Case already reviewed by AI"

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
        + ". Return exactly one line in this format: "
        + "CLAIMANT_WINS|LOW|reason, CLAIMANT_WINS|MEDIUM|reason, CLAIMANT_WINS|HIGH|reason, "
        + "RESPONDENT_WINS|LOW|reason, RESPONDENT_WINS|MEDIUM|reason, RESPONDENT_WINS|HIGH|reason, "
        + "SPLIT|LOW|reason, SPLIT|MEDIUM|reason, SPLIT|HIGH|reason, "
        + "or NEEDS_MORE_INFO|LOW|reason, NEEDS_MORE_INFO|MEDIUM|reason, NEEDS_MORE_INFO|HIGH|reason."
    )

    result = gl.nondet.exec_prompt(prompt)
    parts = result.split("|")

    assert len(parts) == 3, "AI result must contain ruling, confidence, and reason"

    ruling = parts[0]
    confidence = parts[1]
    reason = parts[2]

    assert (
        ruling == "CLAIMANT_WINS"
        or ruling == "RESPONDENT_WINS"
        or ruling == "SPLIT"
        or ruling == "NEEDS_MORE_INFO"
    ), "Invalid AI ruling"

    assert confidence == "LOW" or confidence == "MEDIUM" or confidence == "HIGH", "Invalid AI confidence"
    assert len(reason) > 0, "AI reason cannot be empty"

    self.case_ai_rulings[case_id] = ruling
    self.case_ai_confidences[case_id] = confidence
    self.case_ai_reasons[case_id] = reason

    return ruling
Stores:

{
  "ai_ruling": "CLAIMANT_WINS",
  "ai_confidence": "HIGH",
  "ai_reason": "..."
}
Trying again fails with:

Case already reviewed by AI
`,
  task: `Create the final version of:

review_case_with_ai(case_id: str) -> str`,
  hints: [
    "Create the final version of:.",
    "review_case_with_ai(case_id: str) -> str",
    "Key line: `def review_case_with_ai(self, case_id: str) -> str:`",
  ],
};

export default content;
