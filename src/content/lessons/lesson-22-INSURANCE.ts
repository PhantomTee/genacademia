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
