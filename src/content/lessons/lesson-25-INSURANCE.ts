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
  task: `Create the final version of:

review_case_with_ai(case_id: str) -> str`,
  hints: [
    "Create the final version of:.",
    "review_case_with_ai(case_id: str) -> str",
    "Key line: `def review_case_with_ai(self, case_id: str) -> str:`",
  ],
};

export default content;
