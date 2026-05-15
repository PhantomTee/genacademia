import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "INSURANCE",
  explanation: `## Lesson 12 — Case JSON View

### What You'll Learn

Students learn how to expose one dispute case as JSON.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

import json
Create:

get_case_json(case_id: str) -> str`,
  hints: [
    "Add:.",
    "import json",
    "Key line: `def get_case_json(self, case_id: str) -> str:`",
  ],
};

export default content;
