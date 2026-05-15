import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 23,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 23 — Comparative Validation

### What You'll Learn

Students learn that AI output should not be blindly trusted. Validators need a way to compare whether answers are equivalent.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Update the prompt so it asks for a stricter format.

Instead of returning only A or B, the AI should return:

A|short reason
or:

B|short reason
Expected code change
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
Then:

result = gl.nondet.exec_prompt(prompt)
parts = result.split("|")

assert len(parts) == 2, "AI result must contain outcome and reason"

winning_outcome = parts[0]
reason = parts[1]

assert winning_outcome == "A" or winning_outcome == "B", "AI must choose A or B"`,
  hints: [
    "Update the prompt so it asks for a stricter format.",
    "Instead of returning only A or B, the AI should return:",
    "Key line: `A|Evidence indicates outcome A happened.`",
  ],
};

export default content;
