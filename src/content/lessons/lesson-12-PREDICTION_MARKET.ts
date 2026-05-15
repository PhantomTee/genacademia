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
  expectedCode: `import json
from genlayer import *
Method:

@gl.public.view
def get_market_json(self, market_id: str) -> str:
    assert market_id in self.market_questions, "Market not found"

    return json.dumps({
        "id": market_id,
        "creator": self.market_creators[market_id].as_hex,
        "question": self.market_questions[market_id],
        "outcome_a": self.market_outcome_a[market_id],
        "outcome_b": self.market_outcome_b[market_id],
        "min_stake": str(self.market_min_stakes[market_id]),
        "status": self.market_statuses[market_id],
    }, sort_keys=True)
Calling:

get_market_json("0")
returns a JSON string like:

{
  "id": "0",
  "creator": "0x...",
  "question": "Will GenLayer grow in 2026?",
  "outcome_a": "Yes",
  "outcome_b": "No",
  "min_stake": "100",
  "status": "active"
}
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
