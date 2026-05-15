import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "INSURANCE",
  explanation: `## Lesson 13 — Listing Open Cases

### What You'll Learn

Students learn how to loop through case IDs and return cases that are not closed.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

get_open_cases_json()
Return cases with status:

submitted
reviewing
ruled
appealed
Do not include:

closed
cancelled`,
  hints: [
    "Add:.",
    "get_open_cases_json()",
    "Key line: `def get_open_cases_json(self) -> str:`",
  ],
};

export default content;
