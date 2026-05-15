import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 13 — Listing Active Markets

### What You'll Learn

Students learn how to loop through indexed IDs and return all active records.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

get_active_markets_json()`,
  hints: [
    "Add:.",
    "get_active_markets_json()",
    "Key line: `def get_active_markets_json(self) -> str:`",
  ],
};

export default content;
