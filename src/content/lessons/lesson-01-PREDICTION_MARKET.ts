import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 1 — What You Are Building: AI-Resolved Markets

### What You'll Learn

You'll learn what a prediction market is, why normal smart contracts struggle with real-world outcomes, and why GenLayer is useful for contracts that need to reason about language, evidence, and real-world events.

They do not write a full contract yet. They inspect the final direction and complete a tiny starter check so the platform knows they understand the project.

### How It Works

The contract begins with the dependency header:

\`\`\`python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
\`\`\`

Then it imports GenLayer:

\`\`\`python
from genlayer import *
\`\`\`

The contract class extends:

\`\`\`python
gl.Contract
\`\`\`

The first state variable is:

project_name: str
The constructor initializes it, and get_project_name() exposes it as a read-only method.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "PredictX"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
`,
  task: `Change the project name from "PredictX" to:

PredictX: AI-Resolved Prediction Market`,
  hints: [
    "Change the project name from 'PredictX' to:.",
    "PredictX: AI-Resolved Prediction Market",
    "Check the expected code — the solution is there.",
  ],
};

export default content;
