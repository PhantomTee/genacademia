import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "DAO",
  explanation: `## Lesson 1 — What You Are Building: AI-Governed DAO

### What You'll Learn
GovMind is a DAO governance contract on GenLayer. Members create proposals, vote, and the AI can summarize and analyze proposals to assist decision-making.

### How It Works
\`\`\`python
class GovMind(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "GovMind"
\`\`\``,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class GovMind(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "GovMind"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
`,
  task: `Change the project name to "GovMind: AI-Governed DAO" inside the constructor.`,
  hints: [
    "The only change is in __init__ — the self.project_name assignment.",
    "Use the full name including the colon and subtitle.",
    "Key line: `self.project_name = 'GovMind: AI-Governed DAO'`",
  ],
};

export default content;
