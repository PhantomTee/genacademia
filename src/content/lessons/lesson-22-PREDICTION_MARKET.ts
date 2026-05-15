import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 22 — Using gl.nondet.exec_prompt

### What You'll Learn

Students learn how to request AI analysis.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

resolve_with_ai(market_id: str, evidence: str)
The method should call:

gl.nondet.exec_prompt(prompt)`,
  hints: [
    "Add:.",
    "resolve_with_ai(market_id: str, evidence: str)",
    "Key line: `def resolve_with_ai(self, market_id: str, evidence: str) -> str:`",
  ],
};

export default content;
