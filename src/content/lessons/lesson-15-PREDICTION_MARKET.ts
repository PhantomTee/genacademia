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
  expectedCode: `@gl.public.view
def get_all_markets_json(self) -> str:
    result = []

    for market_id in self.market_ids:
        result.append({
            "id": market_id,
            "creator": self.market_creators[market_id].as_hex,
            "question": self.market_questions[market_id],
            "outcome_a": self.market_outcome_a[market_id],
            "outcome_b": self.market_outcome_b[market_id],
            "min_stake": str(self.market_min_stakes[market_id]),
            "status": self.market_statuses[market_id],
        })

    return json.dumps(result, sort_keys=True)
Returns all markets whether active or closed.
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
