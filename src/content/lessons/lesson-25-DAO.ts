import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 25,
  projectPath: "DAO",
  explanation: `## Lesson 25 — Capstone: Token-Weighted Voting

This capstone brings together payable membership fees, contract-to-contract calls, and proposal state management into a complete token-weighted voting system for GovMind.

### weighted_vote

The new \`weighted_vote(pid, approve)\` method replaces one-member-one-vote with a system where each vote carries the weight of the voter's token balance:

1. **Require membership** — non-members cannot vote
2. **Get token weight** — call \`get_voter_weight(caller)\` to look up the token balance
3. **Apply weight** — add the weight to \`votes_for\` or \`votes_against\`

\`\`\`python
@gl.public.write
def weighted_vote(self, pid: int, approve: bool) -> None:
    caller = gl.message.sender_address
    if not self.members.get(caller, False):
        raise gl.vm.UserError("Members only")
    proposal = self.proposals[pid]
    if proposal.status != PENDING:
        raise gl.vm.UserError("Proposal not open for voting")
    weight = self.get_voter_weight(caller)
    if approve:
        proposal.votes_for += weight
    else:
        proposal.votes_against += weight
\`\`\`

### Why Separate get_voter_weight?

Keeping the token lookup in its own method makes it reusable: the AI evaluator, tie-breaker, and future quorum checks can all call \`get_voter_weight\` without duplicating the \`gl.call_contract\` logic.

### The Complete DAO Economic Loop

At this point GovMind has a full lifecycle:
1. Members pay fees to join (payable)
2. Members submit proposals
3. Members vote with token-weighted influence
4. Admin triggers AI evaluation
5. Admin funds approved proposals (gl.send)

This is a production-quality DAO governance contract.`,
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
            title=title,
            description=description,
            ref_url=ref_url,
            proposer=caller,
        )
        self.proposal_count += 1
        self.proposal_index.add(title, {"pid": pid})
        return pid

    @gl.public.write
    def fund_proposal(self, pid: int, amount: u256) -> None:
        if gl.message.sender_address != self.admin:
            raise gl.vm.UserError("Admin only")
        proposal = self.proposals.get(pid)
        if proposal is None:
            raise gl.vm.UserError("Proposal not found")
        if proposal.status != APPROVED:
            raise gl.vm.UserError("Proposal not approved")
        if self.treasury < amount:
            raise gl.vm.UserError("Insufficient treasury")
        gl.send(proposal.proposer, amount)
        self.treasury -= amount

    @gl.public.write
    def weighted_vote(self, pid: int, approve: bool) -> None:
        # TODO: raise UserError if caller is not a member
        # TODO: get the proposal from self.proposals[pid], raise if missing
        # TODO: raise UserError if proposal.status != PENDING
        # TODO: get voter weight via self.get_voter_weight(caller)
        # TODO: add weight to proposal.votes_for if approve else votes_against
        pass`,
  task: "Implement `weighted_vote()`: require membership, check the proposal is PENDING, call `get_voter_weight()` for the caller's token balance, and add that weight to `proposal.votes_for` (if approve) or `proposal.votes_against`.",
  hints: [
    "Get the caller: `caller = gl.message.sender_address` then check `self.members.get(caller, False)` — raise `gl.vm.UserError('Members only')` if False.",
    "Fetch the proposal: `proposal = self.proposals.get(pid)` — raise if `None`, then check `proposal.status != PENDING` and raise if so.",
    "Get weight and apply: `weight = self.get_voter_weight(caller)` then `proposal.votes_for += weight` if approve else `proposal.votes_against += weight`.",
  ],
};

export default content;
