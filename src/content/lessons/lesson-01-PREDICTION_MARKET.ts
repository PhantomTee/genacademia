import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 1 — What You Are Building

Welcome to PredictX: an AI-resolved prediction market built on GenLayer.

A **prediction market** lets users stake tokens on the outcome of a real-world question — "Will ETH exceed $10,000 by end of 2025?" After the deadline, the market resolves and winners receive the pooled stakes. The hard part is *resolution*: a traditional smart contract cannot browse the web or reason about ambiguous text, so it can't fairly judge outcomes.

GenLayer's **Optimistic Simulator** solves this. Validators run your Python contract with a real web-browsing LLM, reach consensus, and commit the result on-chain — no trusted oracle required.

Every GenLayer contract is a Python class that extends \`gl.Contract\`:

\`\`\`python
class PredictX(gl.Contract):
    project_name: str          # persisted on-chain automatically

    def __init__(self) -> None:
        self.project_name = "PredictX"
\`\`\`

State variables are **class-level type annotations** — they are persisted between calls automatically. You never write to a database; GenLayer handles storage.

\`@gl.public.view\` marks a method as read-only. View methods can be called for free (no gas) and must not modify state:

\`\`\`python
@gl.public.view
def get_project_name(self) -> str:
    return self.project_name
\`\`\`

The file always begins with the SDK dependency header, then \`from genlayer import *\`, then the class definition.`,
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
  task: "Change the project name from \"PredictX\" to \"PredictX: AI-Resolved Prediction Market\" inside the constructor.",
  hints: [
    "The only change needed is in `__init__` — find the line where `self.project_name` is assigned.",
    "Replace the string value `\"PredictX\"` with the longer name including the colon and subtitle.",
    "The correct value is: `self.project_name = \"PredictX: AI-Resolved Prediction Market\"`",
  ],
};

export default content;
