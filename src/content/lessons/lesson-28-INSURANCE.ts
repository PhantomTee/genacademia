import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 28,
  projectPath: "INSURANCE",
  explanation: `## Lesson 28 — Testing CaseWise

### What You'll Learn

Students learn how to test the full dispute lifecycle.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

get_test_checklist_json()`,
  hints: [
    "Add:.",
    "get_test_checklist_json()",
    "Key line: `def get_test_checklist_json(self) -> str:`",
  ],
};

export default content;
