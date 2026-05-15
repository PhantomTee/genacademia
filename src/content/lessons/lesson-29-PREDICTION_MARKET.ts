import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 29,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 29 — Capstone Assembly

### What You'll Learn

Students assemble the final PredictX contract.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `The platform does not need one specific method output. It checks that the final contract contains all expected modules.
`,
  task: `Make sure the contract includes all required components:

Identity
Market creation
Market listing
JSON views
Status transitions
Staking
User stake tracking
Manual resolution
AI resolution
Claim tracking
Frontend action mapping
Test checklist`,
  hints: [
    "Make sure the contract includes all required components:.",
    "Compare your code against the expected output in the lesson guide.",
    "Key line: `The platform does not need one specific method output. It checks that the final contract contains all expected modules.`",
  ],
};

export default content;
