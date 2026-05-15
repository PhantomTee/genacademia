import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 24,
  projectPath: "INSURANCE",
  explanation: `## Lesson 24 — Structured Ruling Output

### What You'll Learn

Students learn how to store AI review results.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `After AI review:

{
  "ai_ruling": "CLAIMANT_WINS",
  "ai_confidence": "HIGH",
  "ai_reason": "The claimant evidence supports the claim.",
  "has_ai_review": true
}
`,
  task: `Add:

case_ai_rulings: TreeMap[str, str]
case_ai_confidences: TreeMap[str, str]
case_ai_reasons: TreeMap[str, str]
Store AI result inside review_case_with_ai.

Update get_case_json to include:

ai_ruling
ai_confidence
ai_reason
has_ai_review
Expected code additions
case_ai_rulings: TreeMap[str, str]
case_ai_confidences: TreeMap[str, str]
case_ai_reasons: TreeMap[str, str]
Inside AI review:

self.case_ai_rulings[case_id] = ruling
self.case_ai_confidences[case_id] = confidence
self.case_ai_reasons[case_id] = reason
Inside get_case_json:

"ai_ruling": self.case_ai_rulings[case_id] if case_id in self.case_ai_rulings else "",
"ai_confidence": self.case_ai_confidences[case_id] if case_id in self.case_ai_confidences else "",
"ai_reason": self.case_ai_reasons[case_id] if case_id in self.case_ai_reasons else "",
"has_ai_review": case_id in self.case_ai_rulings,`,
  hints: [
    "Add:.",
    "case_ai_rulings: TreeMap[str, str]",
    "Key line: `After AI review:`",
  ],
};

export default content;
