import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "INSURANCE",
  explanation: `## Lesson 20 — Major Upgrade: Paid Dispute Flow

### What You'll Learn

Students combine:

case submission
case fee payment
evidence submission
manual ruling
case JSON
status flow`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Update get_case_json to include:

ruling
ruling_reason
Expected updated JSON fields
Add inside get_case_json:

"ruling": self.case_rulings[case_id] if case_id in self.case_rulings else "",
"ruling_reason": self.case_ruling_reasons[case_id] if case_id in self.case_ruling_reasons else "",`,
  hints: [
    "Update get_case_json to include:.",
    "Compare your code against the expected output in the lesson guide.",
    "Key line: `After manual ruling:`",
  ],
};

export default content;
