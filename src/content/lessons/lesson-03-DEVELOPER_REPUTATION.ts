import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 3 — Input Validation and User Errors

Accepting unvalidated input is one of the most common smart contract bugs. A blank handle or a duplicate registration would corrupt CodeVault's data. GenLayer provides \`gl.vm.UserError\` to signal invalid inputs cleanly.

### Raising User Errors

\`\`\`python
raise gl.vm.UserError("handle cannot be empty")
\`\`\`

This reverts the transaction and surfaces a readable error message to the caller. The contract state is **not changed** when a UserError is raised — all writes are rolled back automatically.

### Validation Order

Always validate **before** modifying state. The canonical pattern is a guard clause at the top of the function:

\`\`\`python
@gl.public.write
def register(self, handle: str) -> None:
    if not handle:
        raise gl.vm.UserError("handle cannot be empty")
    if self.registered.get(gl.message.sender_address, False):
        raise gl.vm.UserError("already registered")
    # ... safe to write now
\`\`\`

### Tracking Registration Status

To detect duplicate registrations you need a way to look up whether an address has already registered. A \`TreeMap[Address, bool]\` (introduced fully in Lesson 11) is the right structure, but for now a simple mapping approach works:

\`\`\`python
registered: TreeMap[Address, bool]
\`\`\`

Store \`True\` when a developer registers, then check with \`.get(addr, False)\`.

### Your Mission

Add duplicate-detection logic to \`register()\`: raise \`gl.vm.UserError\` if the handle is empty or if the sender has already registered.

**Key concepts this lesson:** \`gl.vm.UserError\`, guard clauses, idempotency protection.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, TreeMap


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    registered: TreeMap[Address, bool]

    def __init__(self, name: str) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.registered = TreeMap[Address, bool]()

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.write
    def register(self, handle: str) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Add validation to `register()`: raise `gl.vm.UserError` if `handle` is empty or if the sender has already registered, then record the registration and increment the count.",
  hints: [
    "Check for an empty handle first: `if not handle: raise gl.vm.UserError('handle cannot be empty')`.",
    "Check for duplicates using `self.registered.get(gl.message.sender_address, False)` before writing any state.",
    "After validation, mark the sender registered with `self.registered[gl.message.sender_address] = True` and increment `self.developer_count`.",
  ],
};

export default content;
