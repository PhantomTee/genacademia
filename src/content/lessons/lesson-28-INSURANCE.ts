import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 28,
  projectPath: "INSURANCE",
  explanation: `## Lesson 28 — Testing CaseWise

### What You'll Learn

Students learn how to test the full dispute lifecycle.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.view
def get_test_checklist_json(self) -> str:
    return json.dumps([
        "Submit a case with title, claim, respondent, and fee",
        "Reject a case with an empty claim",
        "Reject a case where claimant and respondent are the same",
        "Pay the case fee as claimant",
        "Reject fee payment from non-claimant",
        "Add claimant evidence",
        "Add respondent evidence",
        "Reject evidence from a non-party",
        "Run AI case review",
        "Verify AI ruling, confidence, and reason are stored",
        "Manually rule the case as owner",
        "Appeal the ruled case as a party",
        "Reject appeal from non-party"
    ], sort_keys=True)
Returns a JSON checklist of test steps.
`,
  task: `Add:

get_test_checklist_json()`,
  hints: [
    "Add:.",
    "get_test_checklist_json()",
    "Key line: `def get_test_checklist_json(self) -> str:`",
  ],
};

export default content;
