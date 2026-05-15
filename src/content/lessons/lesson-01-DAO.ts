import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "DAO",
  explanation: `## Lesson 1 — Your First GenLayer Contract: Reading State

Welcome to **GovMind**, the AI-governed DAO you will build over the next 30 lessons. By the end of the course, GovMind will be a fully functioning Decentralized Autonomous Organization on GenLayer that uses artificial intelligence to evaluate governance proposals — a capability impossible on traditional blockchains.

### Contracts as Objects

A GenLayer intelligent contract is simply a Python class that inherits from \`gl.Contract\`. Each instance of the class corresponds to one deployed contract on-chain. Class-level type annotations declare **persistent state** — variables stored in the ledger forever.

\`\`\`python
class GovernanceDAO(gl.Contract):
    name: str          # stored on-chain
\`\`\`

### The \`__init__\` Constructor

\`__init__\` runs exactly once when the contract is deployed. It receives deployment arguments and must initialise every state variable. Here you receive the DAO's display name and store it.

### View Methods

The \`@gl.public.view\` decorator marks a **read-only** method. View methods:
- Can be called for free (no gas, no transaction)
- Cannot modify state
- Return data to callers

Your first method, \`get_name()\`, simply reads \`self.name\` and returns it. This pattern — store once, read many times — is the foundation of all on-chain data retrieval.

### Why This Matters for DAOs

Every governance system needs an identity. The DAO's name is the first piece of metadata members and external systems rely on. Getting reads right before writes ensures you understand the execution model before adding mutations.

Implement \`get_name()\` and you will have deployed your first working piece of GovMind.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl

class GovernanceDAO(gl.Contract):
    name: str

    def __init__(self, name: str) -> None:
        self.name = name

    @gl.public.view
    def get_name(self) -> str:
        pass`,
  task: "Implement `get_name()` to return the DAO's stored name.",
  hints: [
    "State variables are accessed through `self` — the DAO name is stored as `self.name`.",
    "`@gl.public.view` marks a read-only method; the body just needs a `return` statement.",
    "The full implementation is a single line: `return self.name`.",
  ],
};

export default content;
