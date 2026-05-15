import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "INSURANCE",
  explanation: `## Lesson 1 — Your First Intelligent Contract: State & View

Welcome to CaseWise Flight Insurance — a parametric insurance protocol built entirely on GenLayer. Over the next 30 lessons you will build every component from scratch.

### What is a GenLayer Contract?

A GenLayer contract is a Python class that inherits from \`gl.Contract\`. Unlike a regular class, every instance variable you declare at the class body level becomes **persistent blockchain state** — it is stored on-chain and survives between transactions.

\`\`\`python
class InsurancePool(gl.Contract):
    pool_name: str  # on-chain storage
\`\`\`

The \`__init__\` method runs exactly once when the contract is deployed. You use it to set initial state values:

\`\`\`python
def __init__(self, name: str) -> None:
    self.pool_name = name
\`\`\`

### View Methods

A **view** method reads state without modifying it. Decorate it with \`@gl.public.view\`. View methods cost no gas and can be called freely by front-ends or other contracts.

\`\`\`python
@gl.public.view
def get_pool_name(self) -> str:
    return self.pool_name
\`\`\`

In CaseWise, the pool name uniquely identifies this insurance product. Every policyholder, claim, and payout will reference the same deployed pool — so exposing the pool name via a public view is the first thing we build.

### Key Takeaways

- Declare state as typed class-level annotations.
- \`__init__\` sets initial values at deploy time.
- \`@gl.public.view\` marks read-only methods safe to call anytime.
- Return types are mandatory and enforced by the runtime.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl

class InsurancePool(gl.Contract):
    pool_name: str

    def __init__(self, name: str) -> None:
        self.pool_name = name

    @gl.public.view
    def get_pool_name(self) -> str:
        pass`,
  task: "Implement `get_pool_name()` to return the pool name stored in `self.pool_name`.",
  hints: [
    "The pool name is stored as `self.pool_name` — it was set in `__init__`.",
    "A view method simply reads state. Use a `return` statement inside `get_pool_name`.",
    "The full implementation is a single line: `return self.pool_name`.",
  ],
};

export default content;
