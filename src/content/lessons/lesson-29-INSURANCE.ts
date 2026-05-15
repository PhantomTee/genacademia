import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 29,
  projectPath: "INSURANCE",
  explanation: `## Lesson 29 — Capstone Assembly

### What You'll Learn

Students assemble the full CaseWise contract.

They verify that all modules exist:

identity
case submission
case indexing
case JSON
open/all case views
case fee payment
evidence submission
manual ruling
AI review
appeal logic
dispute rules
test checklist`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: ``,
  hints: [
    "Read the task description carefully — the change is small.",
    "Look at the expected code section for the exact pattern to follow.",
    "Check the expected code — the solution is there.",
  ],
};

export default content;
