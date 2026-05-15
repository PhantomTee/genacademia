import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 26,
  projectPath: "INSURANCE",
  explanation: `## Lesson 26 — Dispute System Safety Mistakes

### What You'll Learn

Students learn the biggest dispute-system mistakes:

ruling before fees are paid
letting non-parties add evidence
allowing empty evidence
letting AI review the same case repeatedly
finalizing a case without reviewing evidence
treating AI recommendation as automatic enforcement
AI should assist the arbitrator, not silently finalize the case.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.view
def get_dispute_rules_json(self) -> str:
    return json.dumps([
        "Only the claimant can pay the case fee",
        "Only case parties can add evidence",
        "Cases must be reviewing before AI review",
        "AI review does not automatically close the case",
        "Only the owner/arbitrator can finalize a ruling",
        "Appeals can only happen after a ruling"
    ], sort_keys=True)
Returns JSON array of dispute safety rules.
`,
  task: `Add:

get_dispute_rules_json()`,
  hints: [
    "Add:.",
    "get_dispute_rules_json()",
    "Key line: `def get_dispute_rules_json(self) -> str:`",
  ],
};

export default content;
