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
  expectedCode: `@gl.public.view
def get_frontend_actions_json(self) -> str:
    return json.dumps({
        "create": "create_market(question, outcome_a, outcome_b, min_stake)",
        "list": "get_active_markets_json()",
        "detail": "get_market_json(market_id)",
        "stake": "stake_on_outcome(market_id, outcome)",
        "close": "close_market(market_id)",
        "resolve": "resolve_with_ai(market_id, evidence)",
        "claim": "claim_winnings(market_id)",
    }, sort_keys=True)
Returns JSON explaining frontend method mappings.
`,
  task: `Add a method that exposes frontend actions as JSON.`,
  hints: [
    "Add a method that exposes frontend actions as JSON.",
    "Look at the expected code section for the exact pattern to follow.",
    "Key line: `def get_frontend_actions_json(self) -> str:`",
  ],
};

export default content;
