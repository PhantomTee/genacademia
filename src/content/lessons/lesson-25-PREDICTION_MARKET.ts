import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 25,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 25 — Major Upgrade: AI Market Resolver

### What You'll Learn

Students combine closed-market state, AI prompt execution, structured output, and resolution state.`,
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
        + ". Return exactly one line in this format: A|reason or B|reason."
    )

    result = gl.nondet.exec_prompt(prompt)
    parts = result.split("|")

    assert len(parts) == 2, "AI result must contain outcome and reason"

    winning_outcome = parts[0]
    reason = parts[1]

    assert winning_outcome == "A" or winning_outcome == "B", "AI must choose A or B"
    assert len(reason) > 0, "AI reason cannot be empty"

    self.market_winning_outcome[market_id] = winning_outcome
    self.market_resolution_reason[market_id] = reason
    self.market_statuses[market_id] = "resolved"

    return winning_outcome
Market becomes:

resolved
AI result stored:

{
  "winning_outcome": "A",
  "resolution_reason": "..."
}
`,
  task: `Create a cleaner final version of resolve_with_ai.`,
  hints: [
    "Create a cleaner final version of resolve_with_ai.",
    "Look at the expected code section for the exact pattern to follow.",
    "Key line: `def resolve_with_ai(self, market_id: str, evidence: str) -> str:`",
  ],
};

export default content;
