import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "DAO",
  explanation: `## Lesson 13 — Address Ownership and Admin Transfer

A DAO that can never change its admin is fragile — the original deployer might lose their private key or need to hand off governance. \`transfer_admin\` allows a safe, authorized handover of the admin role using the \`Address\` type.

### Address as a First-Class Value

Addresses are not just strings. In GenLayer, \`Address\` values can be:
- Stored in state variables
- Compared with \`==\`
- Passed as function arguments
- Validated for non-zero value

\`\`\`python
def transfer_admin(self, new_admin: Address) -> None:
    if gl.message.sender_address != self.admin:
        raise gl.vm.UserError("only admin can transfer")
    self.admin = new_admin
\`\`\`

### Validating the New Address

Always validate that the incoming address is meaningful. A zero address (\`0x0000...0000\`) typically means "no address" — assigning it would permanently lock the contract with no admin.

\`\`\`python
zero = Address("0x0000000000000000000000000000000000000000")
if new_admin == zero:
    raise gl.vm.UserError("cannot transfer to zero address")
\`\`\`

### Two-Step Transfers (Advanced)

Production contracts often use a two-step pattern: the current admin proposes a new admin, and the new admin must accept. This prevents accidents where the admin is transferred to a typo'd address. For GovMind we keep it simple — one step — but be aware the two-step pattern exists.

### Why This Matters for DAO Longevity

DAOs are meant to outlast their founders. A transferable admin role is the minimum viable succession plan. Future lessons will replace this with a full multi-sig or proposal-based admin change.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap, DynArray
from dataclasses import dataclass

@dataclass
class Proposal:
    title: str
    proposer: Address
    votes_for: int = 0
    votes_against: int = 0

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    proposal_count: int
    members: TreeMap[Address, bool]
    proposals: TreeMap[int, Proposal]
    proposal_ids: DynArray[int]

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, Proposal]()
        self.proposal_ids = DynArray[int]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.view
    def get_admin(self) -> str:
        return str(self.admin)

    @gl.public.write
    def transfer_admin(self, new_admin: Address) -> None:
        # TODO: check caller is current admin
        # TODO: raise UserError if new_admin is zero address
        # TODO: assign self.admin = new_admin
        pass`,
  task: "Implement `transfer_admin()` so only the current admin can change the admin address, and raise an error if the new address is the zero address.",
  hints: [
    "First check: `if gl.message.sender_address != self.admin: raise gl.vm.UserError('not the admin')`.",
    "Zero address check: `zero = Address('0x0000000000000000000000000000000000000000'); if new_admin == zero: raise gl.vm.UserError('zero address')`.",
    "If both checks pass, simply assign: `self.admin = new_admin`.",
  ],
};

export default content;
