import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 13 — Address Type and Curator Transfer

So far the curator is set once at deployment and can never change. Real systems need curator rotation — for example, handing control to a DAO or a new admin. \`transfer_curator\` implements this safely.

### Address Equality

Comparing addresses in GenLayer uses standard Python equality:

\`\`\`python
if gl.message.sender_address != self.curator:
    raise gl.vm.UserError("only curator can transfer")
\`\`\`

### Zero-Address Check

The zero address (\`Address("0x" + "0" * 40)\`) is the null address. Transferring curator rights to it would lock the contract permanently:

\`\`\`python
zero = Address("0x" + "0" * 40)
if new_curator == zero:
    raise gl.vm.UserError("cannot transfer to zero address")
\`\`\`

### Transfer Pattern

A safe transfer has three guards:
1. Caller must be the current curator
2. New address must not be zero
3. New address must differ from current curator (optional but good practice)

\`\`\`python
@gl.public.write
def transfer_curator(self, new_curator: Address) -> None:
    if gl.message.sender_address != self.curator:
        raise gl.vm.UserError("only curator")
    zero = Address("0x" + "0" * 40)
    if new_curator == zero:
        raise gl.vm.UserError("zero address")
    self.curator = new_curator
\`\`\`

### Why This Matters

Curator transfer is a critical security function. An error here could lock the registry permanently or hand control to an attacker. Always test the three branches.

**Key concepts this lesson:** \`Address\` comparison, zero-address check, ownership transfer pattern.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


@dataclass
class DevProfile:
    handle: str
    github_url: str
    score: int = 0
    endorsements: int = 0
    verified: bool = False


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    curator: Address
    registry_id: u256
    active: bool
    developers: TreeMap[Address, DevProfile]

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.view
    def get_curator(self) -> str:
        return str(self.curator)

    @gl.public.view
    def is_active(self) -> bool:
        return self.active

    @gl.public.write
    def register(self, handle: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.developers.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already registered")
        profile = DevProfile(handle=handle, github_url="")
        self.developers[gl.message.sender_address] = profile
        self.developer_count += 1

    @gl.public.write
    def transfer_curator(self, new_curator: Address) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `transfer_curator()` so that only the current curator can call it, the new address cannot be the zero address, and the curator is updated to `new_curator`.",
  hints: [
    "Check `if gl.message.sender_address != self.curator: raise gl.vm.UserError('only curator')` first.",
    "Check for zero address: `if new_curator == Address('0x' + '0' * 40): raise gl.vm.UserError('zero address')`.",
    "If both checks pass, assign `self.curator = new_curator`.",
  ],
};

export default content;
