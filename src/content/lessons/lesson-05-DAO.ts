import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "DAO",
  explanation: `## Lesson 5 — Capstone: Identity and Access Control

This capstone consolidates everything from Lessons 1–4: state, reads, writes, validation, and typed addresses. You will implement the **admin-only** \`kick_member\` function and the \`is_admin\` view — the security backbone of GovMind.

### Admin-Only Pattern

Many DAO operations should only be available to the administrator: removing bad actors, changing parameters, or executing funded proposals. The pattern is always the same: check first, act second.

\`\`\`python
if gl.message.sender_address != self.admin:
    raise gl.vm.UserError("not the admin")
\`\`\`

This one-liner is GovMind's primary access control. Because \`self.admin\` is set to the deployer at construction and only changed by an authenticated transfer (covered later), this check is cryptographically secure.

### kick_member

In a real DAO, members can be removed for misbehaviour. \`kick_member\` decrements the counter and removes the address from the \`members\` map. You must:
1. Verify the caller is admin
2. Verify the target is actually a member
3. Remove them and decrement the count

### is_admin View

This helper view takes any \`Address\` and returns \`True\` if it matches \`self.admin\`. It is used by governance UIs to conditionally show admin-only controls without revealing private state — the admin address is public anyway.

### Composing Lessons 1–4

Notice how this lesson uses every concept: \`Address\` types (L4), \`UserError\` validation (L3), write methods (L2), and view methods (L1). Capstone lessons test your ability to combine building blocks into coherent features.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    members: TreeMap[Address, bool]

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.members = TreeMap[Address, bool]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.view
    def get_admin(self) -> str:
        return str(self.admin)

    @gl.public.view
    def get_member_count(self) -> int:
        return self.member_count

    @gl.public.view
    def is_admin(self, addr: Address) -> bool:
        pass

    @gl.public.write
    def join(self) -> None:
        if not self.name:
            raise gl.vm.UserError("DAO name is empty")
        if self.members.get(gl.message.sender_address, False):
            raise gl.vm.UserError("already a member")
        if self.member_count >= 1000:
            raise gl.vm.UserError("DAO is full")
        self.members[gl.message.sender_address] = True
        self.member_count += 1

    @gl.public.write
    def kick_member(self, target: Address) -> None:
        pass`,
  task: "Implement `kick_member()` (admin-only, decrements `member_count` and removes target from `self.members`) and `is_admin()` (returns `True` if `addr == self.admin`).",
  hints: [
    "Start `kick_member` with an admin check: `if gl.message.sender_address != self.admin: raise gl.vm.UserError('not the admin')`.",
    "Also verify the target is a member before removing: `if not self.members.get(target, False): raise gl.vm.UserError('not a member')`.",
    "`is_admin` is one line: `return addr == self.admin`.",
  ],
};

export default content;
