import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 18,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 18 — Tracking User Stakes

### What You'll Learn

Students learn how to track user-specific staking.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `If user stakes 100 on A, their stake key stores:

100
`,
  task: `Add:

user_stakes_a: TreeMap[str, u256]
user_stakes_b: TreeMap[str, u256]
Use a composite key:

stake_key = market_id + "_" + gl.message.sender_address.as_hex
Expected code additions
user_stakes_a: TreeMap[str, u256]
user_stakes_b: TreeMap[str, u256]
Inside stake_on_outcome:

stake_key = market_id + "_" + gl.message.sender_address.as_hex

if outcome == "A":
    if stake_key not in self.user_stakes_a:
        self.user_stakes_a[stake_key] = u256(0)
    self.user_stakes_a[stake_key] += gl.message.value
    self.market_total_a[market_id] += gl.message.value
elif outcome == "B":
    if stake_key not in self.user_stakes_b:
        self.user_stakes_b[stake_key] = u256(0)
    self.user_stakes_b[stake_key] += gl.message.value
    self.market_total_b[market_id] += gl.message.value
else:
    assert False, "Invalid outcome"`,
  hints: [
    "Add:.",
    "user_stakes_a: TreeMap[str, u256]",
    "Key line: `If user stakes 100 on A, their stake key stores:`",
  ],
};

export default content;
