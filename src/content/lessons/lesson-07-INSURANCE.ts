import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "INSURANCE",
  explanation: `## Lesson 7 — Party Address Tracking

### What You'll Learn

Students learn how to track the parties in a dispute.

The claimant is the caller who submits the case:

gl.message.sender_address
The respondent is passed as an Address.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add a first version of:

submit_case(title: str, claim: str, respondent: Address) -> str
For now, use:

case_id = "0"
Store:

self.case_claimants[case_id] = gl.message.sender_address
self.case_respondents[case_id] = respondent`,
  hints: [
    "Add a first version of:.",
    "submit_case(title: str, claim: str, respondent: Address) -> str",
    "Key line: `def submit_case(self, title: str, claim: str, respondent: Address) -> str:`",
  ],
};

export default content;
