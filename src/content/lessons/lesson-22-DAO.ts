import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "DAO",
  explanation: `## Lesson 22 — gl.send: Funding Approved Proposals

Once a proposal is approved and the treasury has funds, the DAO needs to pay out. GenLayer's \`gl.send(address, amount)\` transfers GEN from the contract to any address — making your smart contract a real on-chain treasury manager.

### gl.send

\`\`\`python
gl.send(recipient_address, amount_in_wei)
\`\`\`

- \`recipient_address\` — an \`Address\` value (e.g. from \`proposal.proposer\`)
- \`amount_in_wei\` — a \`u256\` amount; the contract must hold at least this much

The call transfers GEN immediately and will revert the entire transaction if the contract has insufficient funds.

### fund_proposal Pattern

The typical pattern for a payout method:

1. **Guard**: caller must be admin, proposal must exist, status must be APPROVED
2. **Balance check**: \`self.treasury >= amount\`
3. **Send**: \`gl.send(proposal.proposer, amount)\`
4. **Update state**: \`self.treasury -= amount\`

Always update state *after* the send — this matches the checks-effects-interactions pattern and prevents re-entrancy style issues.

### Access Control

Only the admin should be able to trigger fund disbursements:

\`\`\`python
if gl.message.sender_address != self.admin:
    raise gl.vm.UserError("Admin only")
\`\`\`

### Treasury Bookkeeping

\`self.treasury\` tracks the contract's expected balance. After sending funds:

\`\`\`python
gl.send(proposal.proposer, amount)
self.treasury -= amount
\`\`\`

This keeps the stored treasury value in sync with what the contract actually holds.`,
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

    @gl.public.view
    def get_treasury(self) -> int:
        return int(self.treasury)

    @gl.public.write
    def fund_proposal(self, pid: int, amount: u256) -> None:
        # TODO: raise UserError if caller is not admin
        # TODO: raise UserError if proposal pid doesn't exist
        # TODO: raise UserError if proposal status is not APPROVED
        # TODO: raise UserError if self.treasury < amount
        # TODO: call gl.send(proposal.proposer, amount)
        # TODO: subtract amount from self.treasury
        pass`,
  task: "Implement `fund_proposal()` (admin only, status must be APPROVED): verify there are sufficient funds, send `amount` from treasury to the proposer via `gl.send`, then deduct from `self.treasury`.",
  hints: [
    "Guard clauses first: check `gl.message.sender_address != self.admin`, then `self.proposals.get(pid)` is not None, then `proposal.status != APPROVED`, then `self.treasury < amount` — raise `gl.vm.UserError` for each.",
    "`gl.send(address, amount)` transfers GEN from the contract to the address — pass `proposal.proposer` and the `amount` parameter.",
    "After the send: `self.treasury -= amount` keeps the bookkeeping accurate. Full payout lines: `gl.send(proposal.proposer, amount); self.treasury -= amount`.",
  ],
};

export default content;
