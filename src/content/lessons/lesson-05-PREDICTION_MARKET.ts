import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 5 — Major Upgrade: Prediction Market Identity Contract

### What You'll Learn

Students combine everything from lessons 1–4 into the first complete PredictX identity contract.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add one more view method:

get_contract_summary()
It should return a readable string containing the name and description.`,
  hints: [
    "Add one more view method:.",
    "get_contract_summary()",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
