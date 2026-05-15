import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 25,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 25 — Major Upgrade: AI Market Resolver

### What You'll Learn

Students combine closed-market state, AI prompt execution, structured output, and resolution state.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Create a cleaner final version of resolve_with_ai.`,
  hints: [
    "Create a cleaner final version of resolve_with_ai.",
    "Look at the expected code section for the exact pattern to follow.",
    "Key line: `def resolve_with_ai(self, market_id: str, evidence: str) -> str:`",
  ],
};

export default content;
