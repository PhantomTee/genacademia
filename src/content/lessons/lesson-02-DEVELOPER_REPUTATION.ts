import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 2 — Write Functions and Counting State

In Lesson 1 you learned how to read state. Now it's time to **change** state. Functions decorated with \`@gl.public.write\` are transactions — every call is recorded on-chain and updates the contract's persistent storage.

### Who Is Calling?

Inside any write function, \`gl.message.sender_address\` gives you the \`Address\` of the account that submitted the transaction. This is the primary way to identify users in a GenLayer contract.

\`\`\`python
caller: Address = gl.message.sender_address
\`\`\`

### Tracking Registrations

CodeVault needs to know how many developers have signed up. A simple integer counter in state is the idiomatic approach:

\`\`\`python
developer_count: int

def __init__(self, name: str) -> None:
    ...
    self.developer_count = 0
\`\`\`

Every call to \`register()\` should increment this counter so it always reflects the true number of registered developers.

### Paired View

Alongside every piece of mutable state, expose a view function so clients can read it without a transaction:

\`\`\`python
@gl.public.view
def get_developer_count(self) -> int:
    return self.developer_count
\`\`\`

### Your Mission

Add \`developer_count\` to state, implement \`register()\` to record the caller and increment the count, and implement \`get_developer_count()\` to return the current tally.

**Key concepts this lesson:** \`@gl.public.write\`, \`gl.message.sender_address\`, integer counters.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int

    def __init__(self, name: str) -> None:
        self.registry_name = name
        self.developer_count = 0

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.write
    def register(self, handle: str) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        pass
`,
  task: "Implement `register()` to record the caller's address as a developer and increment `developer_count`, then implement `get_developer_count()` to return the current count.",
  hints: [
    "Use `gl.message.sender_address` to get the caller's address inside `register()`.",
    "Increment the counter with `self.developer_count += 1` inside `register()`.",
    "`get_developer_count()` needs a single line: `return self.developer_count`.",
  ],
};

export default content;
