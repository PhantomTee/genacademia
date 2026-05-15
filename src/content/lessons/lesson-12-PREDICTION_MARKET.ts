import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 12 — Market JSON View

### What You'll Learn

Students learn how to return frontend-friendly JSON using json.dumps.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

import json
Then create:

get_market_json(market_id: str) -> str`,
  hints: [
    "Add:.",
    "import json",
    "Key line: `def get_market_json(self, market_id: str) -> str:`",
  ],
};

export default content;
