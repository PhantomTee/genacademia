import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 1 — Your First View Method

Welcome to TrustLance — a decentralized freelance escrow platform built on GenLayer. Over 30 lessons you will build a complete intelligent contract that posts a job, evaluates applicants with AI, holds funds in escrow, and resolves disputes.

Every contract in GenLayer is a Python class that inherits from \`gl.Contract\`. State variables are declared at class level with type annotations, and GenLayer automatically persists them to the blockchain between calls.

### Storing State

To store the job title on-chain, declare it as a class-level annotation:

\`\`\`python
class FreelanceEscrow(gl.Contract):
    title: str
\`\`\`

The constructor (\`__init__\`) initialises those variables. Whatever you assign to \`self.title\` in \`__init__\` will survive across transactions.

### Reading State — \`@gl.public.view\`

View methods are **read-only**: they never modify the blockchain and cost no gas. Decorate them with \`@gl.public.view\`. A view method simply returns a value from \`self\`:

\`\`\`python
@gl.public.view
def get_title(self) -> str:
    return self.title
\`\`\`

This is the first building block of TrustLance — letting anyone query the job description without paying a transaction fee.

### The Running Job

For this entire course the job title is:

> *"Build a personal portfolio website. Budget: 0.5 ETH. Deadline: 30 days."*

You will pass this string when deploying the contract and retrieve it through \`get_title\`.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl


class FreelanceEscrow(gl.Contract):
    title: str

    def __init__(self, title: str) -> None:
        self.title = title

    @gl.public.view
    def get_title(self) -> str:
        pass  # TODO: return the stored job title
`,
  task: "Implement `get_title()` so it returns the job title that was stored in the constructor.",
  hints: [
    "State variables declared in the class are accessed through `self` — e.g. `self.title`.",
    "`@gl.public.view` marks the method as read-only; the body just needs a `return` statement.",
    "The complete implementation is a single line: `return self.title`.",
  ],
};

export default content;
