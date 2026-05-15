import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 27,
  projectPath: "DAO",
  explanation: `## Lesson 27 — Upgradable Contracts: Swapping the AI Evaluator

Smart contracts are immutable by default, but you can build upgradeability into your design by storing the address of a dependency as state and allowing it to be updated. GovMind uses this pattern for its AI evaluator.

### The Evaluator Contract Pattern

Instead of hard-coding AI evaluation logic, GovMind stores the evaluator's address:

\`\`\`python
evaluator_contract: Address
\`\`\`

When better AI models or improved evaluation logic become available, the admin can point the DAO at a new evaluator contract — no redeployment of the DAO itself required.

### set_evaluator

\`\`\`python
@gl.public.write
def set_evaluator(self, new_evaluator: Address) -> None:
    if gl.message.sender_address != self.admin:
        raise gl.vm.UserError("Admin only")
    if new_evaluator == Address(0):
        raise gl.vm.UserError("Invalid address")
    self.evaluator_contract = new_evaluator
    self.version += 1
\`\`\`

The \`version\` counter gives a simple audit trail — each upgrade bumps the version number, making it easy to track how many times the evaluator has been replaced.

### get_version

A public view to expose the current version:

\`\`\`python
@gl.public.view
def get_version(self) -> int:
    return self.version
\`\`\`

### Upgrade Patterns in Production

This simple address-swap pattern is the foundation of more sophisticated upgrade systems (like proxy contracts). For GovMind it's sufficient: the DAO's governance rules stay stable while the AI intelligence can improve over time.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass

PENDING = "PENDING"
APPROVED = "APPROVED"
REJECTED = "REJECTED"
EXECUTED = "EXECUTED"

MIN_MEMBERSHIP_FEE = 10**15  # 0.001 GEN in wei

@dataclass
class Proposal:
    title: str
    description: str
    ref_url: str
    proposer: Address
    status: str = "PENDING"
    votes_for: int = 0
    votes_against: int = 0
    executed: bool = False

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    proposal_count: int
    members: TreeMap[Address, bool]
    proposals: TreeMap[int, Proposal]
    proposal_index: gl.VectorStorage
    token_contract: Address
    evaluator_contract: Address
    version: int

    def __init__(self, name: str, token_contract: Address, evaluator_contract: Address) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.version = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, Proposal]()
        self.proposal_index = gl.VectorStorage()
        self.token_contract = token_contract
        self.evaluator_contract = evaluator_contract

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.view
    def get_voter_weight(self, voter: Address) -> int:
        return int(gl.call_contract(self.token_contract, "balance_of", [voter]))

    @gl.public.write.payable
    def join(self) -> None:
        caller = gl.message.sender_address
        if gl.message.value < MIN_MEMBERSHIP_FEE:
            raise gl.vm.UserError("Membership fee too low")
        if self.members.get(caller, False):
            raise gl.vm.UserError("Already a member")
        self.members[caller] = True
        self.member_count += 1
        self.treasury += gl.message.value

    @gl.public.write
    def resolve_tie(self, pid: int) -> None:
        if gl.message.sender_address != self.admin:
            raise gl.vm.UserError("Admin only")
        proposal = self.proposals.get(pid)
        if proposal is None:
            raise gl.vm.UserError("Proposal not found")
        if proposal.votes_for != proposal.votes_against:
            raise gl.vm.UserError("Not a tie")
        r = gl.get_random_u8()
        proposal.status = APPROVED if r < 128 else REJECTED

    @gl.public.write
    def set_evaluator(self, new_evaluator: Address) -> None:
        # TODO: raise UserError if caller is not admin
        # TODO: raise UserError if new_evaluator is zero address (Address(0))
        # TODO: set self.evaluator_contract = new_evaluator
        # TODO: increment self.version
        pass

    @gl.public.view
    def get_version(self) -> int:
        # TODO: return self.version
        pass`,
  task: "Implement `set_evaluator()` (admin only) to validate the new address is non-zero, update `self.evaluator_contract`, and increment `self.version`. Implement `get_version()` to return `self.version`.",
  hints: [
    "Guard with admin check first, then validate the address: `if new_evaluator == Address(0): raise gl.vm.UserError('Invalid address')`.",
    "After validation: `self.evaluator_contract = new_evaluator` and `self.version += 1` — both updates happen in the same transaction.",
    "`get_version` is a one-liner: `return self.version`.",
  ],
};

export default content;
