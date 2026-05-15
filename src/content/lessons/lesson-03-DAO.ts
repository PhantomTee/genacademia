import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "DAO",
  explanation: `## Lesson 3 — Input Validation with UserError

Real contracts fail gracefully. Without validation, anyone can join an unnamed DAO or overflow the member list — breaking GovMind's governance invariants. This lesson teaches **defensive programming** with \`gl.vm.UserError\`.

### Why Validate?

On-chain state is permanent. A bad write cannot be undone without an admin escape hatch. Catching problems at the entry point — before any state changes — is the safest strategy.

### gl.vm.UserError

GenLayer distinguishes between **system errors** (bugs) and **user errors** (invalid input). Raising \`gl.vm.UserError\` signals that the transaction is invalid due to caller behaviour, not a contract bug. The transaction is reverted cleanly and the caller receives the error message.

\`\`\`python
if self.member_count >= 1000:
    raise gl.vm.UserError("DAO is full")
\`\`\`

### Guard-Then-Mutate Pattern

The safest write method structure is:

1. **Check all preconditions** — raise UserError if any fail
2. **Mutate state** — only if all checks pass

This ensures atomicity: either all mutations succeed or none do. Never interleave checks and mutations.

### DAO Invariants to Enforce

For GovMind's \`join()\`:
- The DAO must have a non-empty name (otherwise it was deployed incorrectly)
- The caller must not already be a member
- The total membership must stay below the capacity limit (1000)

Enforcing these rules now prevents much harder bugs later when treasury funds or voting power depend on membership integrity.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, TreeMap

class GovernanceDAO(gl.Contract):
    name: str
    member_count: int
    members: TreeMap[Address, bool]

    def __init__(self, name: str) -> None:
        self.name = name
        self.member_count = 0
        self.members = TreeMap[Address, bool]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.view
    def get_member_count(self) -> int:
        return self.member_count

    @gl.public.write
    def join(self) -> None:
        # TODO: raise UserError if name is empty
        # TODO: raise UserError if caller is already a member
        # TODO: raise UserError if member_count >= 1000
        # TODO: record member and increment count
        pass`,
  task: "Add validation to `join()`: raise `gl.vm.UserError` if the DAO name is empty, if the caller is already a member, or if `member_count` would reach the 1000-member cap.",
  hints: [
    "Check each condition before mutating state: `if not self.name: raise gl.vm.UserError('DAO name is empty')`.",
    "Use `.get(addr, False)` to safely check existing membership: `if self.members.get(gl.message.sender_address, False): raise gl.vm.UserError('already a member')`.",
    "Cap enforcement: `if self.member_count >= 1000: raise gl.vm.UserError('DAO is full')` — place all checks before `self.members[...] = True`.",
  ],
};

export default content;
