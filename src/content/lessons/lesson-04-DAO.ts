import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "DAO",
  explanation: `## Lesson 4 — Types: Address and u256

GenLayer provides specialised types that map directly to blockchain primitives. Two of the most important for GovMind are \`Address\` (wallet identifiers) and \`u256\` (large unsigned integers used for balances).

### The Address Type

An \`Address\` represents a 20-byte Ethereum-compatible wallet or contract identifier. It is cryptographically derived from a private key and is the canonical way to identify participants on-chain.

\`\`\`python
from genlayer.types import Address
admin: Address
\`\`\`

The deployer's address is captured at construction time via \`gl.message.sender_address\`. Storing it as \`self.admin\` is the standard pattern for ownership and access control — the admin field is your contract's root of trust.

### The u256 Type

Ethereum token amounts are represented as integers with 18 decimal places of precision (wei). Python's arbitrary-precision integers handle this, but \`u256\` communicates intent — this field holds a non-negative token amount. For treasury tracking:

\`\`\`python
from genlayer.types import u256
treasury: u256
\`\`\`

Initialise to \`0\` in \`__init__\` and accumulate membership fees or donations over time.

### Why Separate Admin from Members?

The \`admin\` address has elevated privileges: kicking members, changing parameters, executing funded proposals. Keeping admin distinct from the members \`TreeMap\` makes access-control checks a simple equality comparison rather than a role lookup.

### get_admin View

Exposing \`self.admin\` as a public view lets governance tools and UIs identify the current DAO owner without inspecting raw storage slots — a small but important transparency feature.`,
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
        # TODO: set self.admin to the deployer's address
        # TODO: set self.treasury to 0
        self.member_count = 0
        self.members = TreeMap[Address, bool]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.view
    def get_admin(self) -> str:
        pass

    @gl.public.view
    def get_member_count(self) -> int:
        return self.member_count

    @gl.public.write
    def join(self) -> None:
        if not self.name:
            raise gl.vm.UserError("DAO name is empty")
        if self.members.get(gl.message.sender_address, False):
            raise gl.vm.UserError("already a member")
        if self.member_count >= 1000:
            raise gl.vm.UserError("DAO is full")
        self.members[gl.message.sender_address] = True
        self.member_count += 1`,
  task: "Set `self.admin = gl.message.sender_address` and `self.treasury = 0` in `__init__`, then implement `get_admin()` to return the admin address as a string.",
  hints: [
    "`gl.message.sender_address` is the address of whoever is executing the current call — at deploy time, that is the deployer.",
    "Initialise both fields in `__init__`: `self.admin = gl.message.sender_address` and `self.treasury = u256(0)`.",
    "`get_admin()` returns a str, so: `return str(self.admin)`.",
  ],
};

export default content;
