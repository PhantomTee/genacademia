import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 23,
  projectPath: "INSURANCE",
  explanation: `## Lesson 23 — Comparative Validation for Rulings

### What You'll Learn

Students learn structured AI output.

Instead of one word, AI should return:

RULING|confidence|reason
Example:

CLAIMANT_WINS|HIGH|The claimant evidence strongly supports the claim.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `CLAIMANT_WINS|HIGH|The claimant evidence supports the claim.
`,
  task: `Update AI review to split output with:

parts = result.split("|")
Expected code pattern
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
assert len(reason) > 0, "AI reason cannot be empty"`,
  hints: [
    "Update AI review to split output with:.",
    "parts = result.split('|')",
    "Key line: `CLAIMANT_WINS|HIGH|The claimant evidence supports the claim.`",
  ],
};

export default content;
