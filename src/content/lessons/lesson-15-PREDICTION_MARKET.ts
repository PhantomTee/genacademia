import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 15 — Major Upgrade: Browseable Market Dashboard Contract

### What You'll Learn

Students combine indexing, JSON views, filtering, and status transitions.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add a method:

get_all_markets_json()
Unlike get_active_markets_json, this should return all markets.`,
  hints: [
    "Add a method:.",
    "get_all_markets_json()",
    "Key line: `def get_all_markets_json(self) -> str:`",
  ],
};

export default content;
