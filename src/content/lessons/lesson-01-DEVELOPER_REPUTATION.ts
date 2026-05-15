import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 1 — Your First GenLayer Contract: State and Views

Welcome to **CodeVault**, an on-chain developer reputation registry built on GenLayer. Over the next 30 lessons you will build this contract from scratch, adding new capabilities step by step.

### GenLayer Contracts 101

A GenLayer intelligent contract is a Python class that inherits from \`gl.Contract\`. Every attribute declared at the class level becomes **persistent on-chain state** — it survives between transactions just like a database record.

\`\`\`python
class DeveloperReputation(gl.Contract):
    registry_name: str
\`\`\`

The \`__init__\` method runs exactly once when the contract is deployed. It receives any constructor arguments and should initialise all state variables.

### Read-Only Views

Functions decorated with \`@gl.public.view\` can be called by anyone without spending gas (they don't change state). They are the public API through which clients read data from the contract.

\`\`\`python
@gl.public.view
def get_registry_name(self) -> str:
    return self.registry_name
\`\`\`

The return type annotation is required — GenLayer uses it to encode the response correctly.

### Your Mission

You are deploying CodeVault's identity: a contract that stores the registry's name on-chain and exposes it via a view function. This is the foundation every subsequent lesson builds upon.

**Key concepts this lesson:** class declaration, state variables, \`__init__\`, \`@gl.public.view\`.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl


class DeveloperReputation(gl.Contract):
    registry_name: str

    def __init__(self, name: str) -> None:
        self.registry_name = name

    @gl.public.view
    def get_registry_name(self) -> str:
        pass
`,
  task: "Implement `get_registry_name()` so it returns the registry name stored in `self.registry_name`.",
  hints: [
    "The registry name was saved to `self.registry_name` inside `__init__` — you just need to return it.",
    "A `@gl.public.view` method reads state but never modifies it. Use a `return` statement.",
    "The complete body is a single line: `return self.registry_name`.",
  ],
};

export default content;
