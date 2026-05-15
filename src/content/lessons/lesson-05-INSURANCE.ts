import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "INSURANCE",
  explanation: `## Lesson 5 — Major Upgrade: Arbitration Platform Identity

### What You'll Learn

Students combine the first four lessons into a complete CaseWise identity contract.

They now know:

contract class
persistent owner
constructor
view methods
write methods
owner-only permissions
basic validation`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

get_contract_summary()
It should return the court name and rules together.`,
  hints: [
    "Add:.",
    "get_contract_summary()",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
