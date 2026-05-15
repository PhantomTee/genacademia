import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 22 — Using gl.nondet.exec_prompt

### What You'll Learn

Students learn how to request AI analysis.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.write
def resolve_with_ai(self, market_id: str, evidence: str) -> str:
    assert market_id in self.market_questions, "Market not found"
    assert self.market_statuses[market_id] == "closed", "Market must be closed before AI resolution"
    assert len(evidence) > 0, "Evidence cannot be empty"

    prompt = (
        "You are resolving a prediction market. "
        + "Question: "
        + self.market_questions[market_id]
        + ". Outcome A: "
        + self.market_outcome_a[market_id]
        + ". Outcome B: "
        + self.market_outcome_b[market_id]
        + ". Evidence: "
        + evidence
        + ". Return only A or B."
    )

    result = gl.nondet.exec_prompt(prompt)

    assert result == "A" or result == "B", "AI must return A or B"

    self.market_winning_outcome[market_id] = result
    self.market_statuses[market_id] = "resolved"

    return result
AI returns:

A
or:

B
Market status becomes:

resolved
`,
  task: `Add:

resolve_with_ai(market_id: str, evidence: str)
The method should call:

gl.nondet.exec_prompt(prompt)`,
  hints: [
    "Add:.",
    "resolve_with_ai(market_id: str, evidence: str)",
    "Key line: `def resolve_with_ai(self, market_id: str, evidence: str) -> str:`",
  ],
};

export default content;
