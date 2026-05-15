import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 27,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 27 — Frontend Integration for Markets

### What You'll Learn

Students learn which methods a frontend should call.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add a method that exposes frontend actions as JSON.`,
  hints: [
    "Add a method that exposes frontend actions as JSON.",
    "Look at the expected code section for the exact pattern to follow.",
    "Key line: `def get_frontend_actions_json(self) -> str:`",
  ],
};

export default content;
