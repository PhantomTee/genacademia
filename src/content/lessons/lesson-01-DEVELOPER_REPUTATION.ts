import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 1 — What You Are Building: Private Code Marketplace

### What You'll Learn
CodeVault is a private code marketplace on GenLayer. Developers list code with an off-chain source hash, buyers pay in escrow, and AI evaluates listing quality — all without revealing the source until payment is confirmed.

### How It Works
\`\`\`python
class CodeVault(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "CodeVault"
\`\`\``,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class CodeVault(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "CodeVault"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
`,
  task: `Change the project name to "CodeVault: Private Code Marketplace" inside the constructor.`,
  hints: [
    "Find the self.project_name assignment in __init__.",
    "Use the full name with subtitle.",
    "Key line: `self.project_name = 'CodeVault: Private Code Marketplace'`",
  ],
};

export default content;
