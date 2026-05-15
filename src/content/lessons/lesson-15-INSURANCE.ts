import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "INSURANCE",
  explanation: `## Lesson 15 — Major Upgrade: Browseable Case Dashboard

### What You'll Learn

Students combine:

case submission
case indexing
case JSON view
open case list
case cancellation
status filtering`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

get_all_cases_json()
It returns all cases regardless of status.`,
  hints: [
    "Add:.",
    "get_all_cases_json()",
    "Key line: `def get_all_cases_json(self) -> str:`",
  ],
};

export default content;
