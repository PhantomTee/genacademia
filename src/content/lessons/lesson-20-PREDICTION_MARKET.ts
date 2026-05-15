import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 20 — Major Upgrade: Full Prediction Value Flow

### What You'll Learn

Students implement a simple claim method. This lesson focuses on state checks, not perfect payout math.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

claim_winnings(market_id: str)
For now, it should mark the user as claimed if they backed the winning side. The actual transfer/payout lesson can be advanced content later.`,
  hints: [
    "Add:.",
    "claim_winnings(market_id: str)",
    "Key line: `def claim_winnings(self, market_id: str) -> None:`",
  ],
};

export default content;
