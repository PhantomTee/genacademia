import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 28,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 28 — Testing the Market Flow

### What You'll Learn

Students learn to think like testers before shipping a contract.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.view
def get_test_checklist_json(self) -> str:
    return json.dumps([
        "Create a market with valid outcomes",
        "Reject a market with duplicate outcomes",
        "Stake on outcome A",
        "Stake on outcome B",
        "Reject staking below minimum",
        "Close the market",
        "Resolve the market with AI evidence",
        "Allow winning users to claim",
        "Reject duplicate claims"
    ], sort_keys=True)
Returns a JSON list of test steps.
`,
  task: `Add a testing checklist method.`,
  hints: [
    "Add a testing checklist method.",
    "Look at the expected code section for the exact pattern to follow.",
    "Key line: `def get_test_checklist_json(self) -> str:`",
  ],
};

export default content;
