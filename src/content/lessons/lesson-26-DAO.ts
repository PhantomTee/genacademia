import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 26,
  projectPath: "DAO",
  explanation: `## Lesson 26 — Randomness: Tie-Breaking with gl.get_random_u8

Token-weighted voting can produce exact ties. Rather than leaving proposals in limbo, GovMind uses on-chain randomness to break ties fairly.

### gl.get_random_u8

\`\`\`python
n = gl.get_random_u8()  # returns an int in range [0, 255]
\`\`\`

GenLayer's \`get_random_u8\` generates a consensus-safe random byte. Unlike off-chain randomness, it participates in GenLayer's BFT consensus — every validator produces the same random value for the same transaction, so the result is deterministic across the network yet unpredictable to any single party before the transaction is finalised.

### The Tie-Breaking Pattern

\`\`\`python
r = gl.get_random_u8()   # 0–255
status = "APPROVED" if r < 128 else "REJECTED"
\`\`\`

Because the range is 0–255, values 0–127 map to APPROVED and 128–255 to REJECTED — giving each outcome a 50/50 chance (128 values each).

### Access Control and Preconditions

Tie-breaking should only run when genuinely tied and only be callable by the admin:

\`\`\`python
if gl.message.sender_address != self.admin:
    raise gl.vm.UserError("Admin only")
if proposal.votes_for != proposal.votes_against:
    raise gl.vm.UserError("Not a tie")
\`\`\`

### Why On-Chain Randomness Matters

Off-chain randomness (e.g. timestamps) can be manipulated by validators. \`gl.get_random_u8\` is safe from manipulation because it is derived from the consensus process itself — no single party can bias the outcome.`,
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

    def __init__(self, name: str, token_contract: Address) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, Proposal]()
        self.proposal_index = gl.VectorStorage()
        self.token_contract = token_contract

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
    def submit_proposal(self, title: str, description: str, ref_url: str) -> int:
        caller = gl.message.sender_address
        if not self.members.get(caller, False):
            raise gl.vm.UserError("Members only")
        pid = self.proposal_count
        self.proposals[pid] = Proposal(
            title=title, description=description, ref_url=ref_url, proposer=caller
        )
        self.proposal_count += 1
        self.proposal_index.add(title, {"pid": pid})
        return pid

    @gl.public.write
    def weighted_vote(self, pid: int, approve: bool) -> None:
        caller = gl.message.sender_address
        if not self.members.get(caller, False):
            raise gl.vm.UserError("Members only")
        proposal = self.proposals.get(pid)
        if proposal is None:
            raise gl.vm.UserError("Proposal not found")
        if proposal.status != PENDING:
            raise gl.vm.UserError("Proposal not open for voting")
        weight = self.get_voter_weight(caller)
        if approve:
            proposal.votes_for += weight
        else:
            proposal.votes_against += weight

    @gl.public.write
    def resolve_tie(self, pid: int) -> None:
        # TODO: raise UserError if caller is not admin
        # TODO: get proposal, raise if not found
        # TODO: raise UserError if votes_for != votes_against
        # TODO: call gl.get_random_u8()
        # TODO: set proposal.status = "APPROVED" if r < 128 else "REJECTED"
        pass`,
  task: "Implement `resolve_tie()` (admin only): verify the proposal exists and votes are exactly tied, then use `gl.get_random_u8()` to set the proposal status to APPROVED (< 128) or REJECTED (>= 128).",
  hints: [
    "Check admin and fetch the proposal first, then guard: `if proposal.votes_for != proposal.votes_against: raise gl.vm.UserError('Not a tie')`.",
    "`gl.get_random_u8()` returns an int from 0 to 255 inclusive — use the midpoint 128 as the decision boundary for a fair 50/50 split.",
    "Full resolution: `r = gl.get_random_u8(); proposal.status = APPROVED if r < 128 else REJECTED`.",
  ],
};

export default content;
