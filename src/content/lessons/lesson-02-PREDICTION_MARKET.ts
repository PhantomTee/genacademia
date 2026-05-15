import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 2 — Contract Skeleton: Constructor, Owner, Typed State

The contract skeleton is the foundation everything else builds on. This lesson covers four key elements:

1. **The dependency header** — tells GenLayer which SDK version to use.
2. **\`from genlayer import *\`** — imports all GenLayer types and decorators.
3. **Class-level state variables** — declared with type annotations; persisted on-chain automatically.
4. **The constructor** — runs once at deploy time to initialise state.

### Storing the deployer as owner

\`gl.message.sender_address\` is the wallet address that called the constructor during deployment. Storing it as \`self.owner\` lets you write owner-only methods later:

\`\`\`python
def __init__(self) -> None:
    self.owner = gl.message.sender_address
\`\`\`

\`Address\` is GenLayer's built-in blockchain address type. It supports equality comparison and has an \`.as_hex\` property for converting to a plain string.

### All state must be declared at class level

Variables created only inside methods are **not** persisted between calls. Only class-level type annotations become on-chain storage:

\`\`\`python
class PredictX(gl.Contract):
    owner: Address          # persisted ✓
    platform_name: str      # persisted ✓

    def __init__(self) -> None:
        local_var = "x"     # NOT persisted — disappears after the call
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
\`\`\``,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
`,
  task: "Add a third persistent field `platform_description: str` declared at class level, and initialize it in `__init__` with the string \"A GenLayer prediction market that uses AI-assisted resolution.\"",
  hints: [
    "Declare `platform_description: str` at class level, on a new line after `platform_name: str`.",
    "In `__init__`, add `self.platform_description = ...` after the other assignments.",
    "The exact string value is: `\"A GenLayer prediction market that uses AI-assisted resolution.\"`",
  ],
};

export default content;
