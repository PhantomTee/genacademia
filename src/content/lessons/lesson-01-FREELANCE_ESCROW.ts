import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 1 — What You Are Building: Freelance Escrow

### What You'll Learn
Freelance work is high-trust: clients pay, freelancers deliver. TrustLance uses GenLayer Intelligent Contracts to hold funds in escrow, release them on confirmed delivery, and resolve disputes via AI — no middleman needed.

### How It Works
Every GenLayer contract is a Python class extending \`gl.Contract\`:

\`\`\`python
class TrustLance(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "TrustLance"
\`\`\`

State variables declared at class level are persisted automatically.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class TrustLance(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "TrustLance"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
`,
  task: `Change the project name from "TrustLance" to "TrustLance: Freelance Escrow Platform" inside the constructor.`,
  hints: [
    "The only change needed is in __init__ — find the line where self.project_name is assigned.",
    "Replace the string value with the full name including the subtitle.",
    "Key line: `self.project_name = 'TrustLance: Freelance Escrow Platform'`",
  ],
};

export default content;
