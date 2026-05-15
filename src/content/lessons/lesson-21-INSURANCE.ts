import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 21,
  projectPath: "INSURANCE",
  explanation: `## Lesson 21 — AI Evidence Review Basics

### What You'll Learn

Students learn how AI can assist case review.

The AI will receive:

case title
claim
claimant evidence
respondent evidence
It should produce a structured ruling recommendation.

This lesson only builds the prompt.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

get_case_review_prompt(case_id: str) -> str`,
  hints: [
    "Add:.",
    "get_case_review_prompt(case_id: str) -> str",
    "Key line: `def get_case_review_prompt(self, case_id: str) -> str:`",
  ],
};

export default content;
