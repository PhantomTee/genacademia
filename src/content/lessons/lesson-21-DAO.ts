import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 21,
  projectPath: "DAO",
  explanation: `## Lesson 21 — Payable Methods: Membership Fees

Real DAOs charge a membership fee to join — it funds the treasury and deters spam. GenLayer supports this with the \`@gl.public.write.payable\` decorator, which allows a method to receive GEN alongside the transaction.

### @gl.public.write.payable

Decorating a method with \`@gl.public.write.payable\` marks it as value-accepting. The caller attaches GEN to the transaction; inside the method, \`gl.message.value\` gives you the amount sent (as a \`u256\` in wei).

\`\`\`python
@gl.public.write.payable
def join(self) -> None:
    fee = gl.message.value   # wei attached by the caller
\`\`\`

Without \`.payable\`, any GEN sent with the transaction is rejected before the method even runs.

### Enforcing a Minimum Fee

Use \`gl.vm.UserError\` to reject transactions that don't meet the minimum:

\`\`\`python
MIN_MEMBERSHIP_FEE = 10**15   # 0.001 GEN in wei

if gl.message.value < MIN_MEMBERSHIP_FEE:
    raise gl.vm.UserError("Membership fee too low")
\`\`\`

### Adding to the Treasury

Once the fee is validated, simply add it to the contract's treasury balance:

\`\`\`python
self.treasury += gl.message.value
\`\`\`

\`self.treasury\` is a \`u256\`, and \`gl.message.value\` is also \`u256\`, so the addition is type-safe.

### Why This Matters

Payable methods are the bridge between on-chain value and contract logic. The treasury accumulated here will fund approved proposals in Lesson 22 — a complete economic loop: members pay in, governance approves spending, and the contract pays out.`,
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

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, Proposal]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.write
    def join(self) -> None:
        # TODO: change decorator to @gl.public.write.payable
        # TODO: raise UserError if gl.message.value < MIN_MEMBERSHIP_FEE
        # TODO: raise UserError if caller is already a member
        # TODO: register member and increment member_count
        # TODO: add gl.message.value to self.treasury
        caller = gl.message.sender_address
        if self.members.get(caller, False):
            raise gl.vm.UserError("Already a member")
        self.members[caller] = True
        self.member_count += 1

    @gl.public.view
    def get_treasury(self) -> int:
        return int(self.treasury)`,
  task: "Change `join()` to `@gl.public.write.payable`, require `gl.message.value >= MIN_MEMBERSHIP_FEE` (raise `gl.vm.UserError` if not), and add the fee to `self.treasury`.",
  hints: [
    "Replace `@gl.public.write` with `@gl.public.write.payable` — this is the only decorator change needed to accept GEN.",
    "Add the fee check before registering the member: `if gl.message.value < MIN_MEMBERSHIP_FEE: raise gl.vm.UserError('Membership fee too low')`.",
    "After registering the member, add `self.treasury += gl.message.value` to credit the fee to the DAO treasury.",
  ],
};

export default content;
