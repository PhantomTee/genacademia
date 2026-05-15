import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 21,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 21 — AI Resolution Basics

### What You'll Learn

Students learn when to use AI in a GenLayer contract and why AI logic must be treated differently from normal deterministic logic.

GenLayer is designed for contracts that can reason over language and external context, but non-deterministic outputs need validation through GenLayer's consensus model.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add a method that prepares a resolution prompt.

For now, it returns a prompt string only.`,
  hints: [
    "Add a method that prepares a resolution prompt.",
    "For now, it returns a prompt string only.",
    "Key line: `def get_resolution_prompt(self, market_id: str, evidence: str) -> str:`",
  ],
};

export default content;
