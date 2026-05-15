import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 14,
  projectPath: "DAO",
  explanation: `## Lesson 14 — State Machines: Proposal Lifecycle

Real governance proposals don't jump from "submitted" to "executed" in one step. They move through a defined sequence of states. This lesson introduces the **state machine** pattern, which enforces that each transition is valid before it happens.

### States and Transitions

GovMind proposals follow this lifecycle:

\`\`\`
PENDING → APPROVED | REJECTED → EXECUTED
\`\`\`

Define states as string constants at module level — they read clearly in code and are readable on-chain:

\`\`\`python
PENDING = "PENDING"
APPROVED = "APPROVED"
REJECTED = "REJECTED"
EXECUTED = "EXECUTED"
\`\`\`

### finalize_proposal

After a vote ends, \`finalize_proposal\` checks the tally and transitions to APPROVED or REJECTED. It must verify the proposal is still PENDING — you cannot finalise an already-finalised proposal.

\`\`\`python
if proposal.status != PENDING:
    raise gl.vm.UserError("already finalised")
proposal.status = APPROVED if proposal.votes_for > proposal.votes_against else REJECTED
\`\`\`

### execute_proposal

Execution is the final step. Only APPROVED proposals can be executed. Once executed, the status becomes EXECUTED and the action (sending funds, calling a sub-contract) is performed.

### Why State Machines?

Without explicit status checks, a bug could allow a proposal to be executed twice or allow a rejected proposal to sneak through. State machines make impossible states unrepresentable — if the check fails, the transaction reverts cleanly.

Add \`status: str = "PENDING"\` to the \`Proposal\` dataclass to initialise every new proposal in the correct starting state.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap, DynArray
from dataclasses import dataclass

PENDING = "PENDING"
APPROVED = "APPROVED"
REJECTED = "REJECTED"
EXECUTED = "EXECUTED"

@dataclass
class Proposal:
    title: str
    proposer: Address
    votes_for: int = 0
    votes_against: int = 0
    status: str = "PENDING"

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

    @gl.public.write
    def submit_proposal(self, title: str) -> int:
        pid = self.proposal_count
        self.proposals[pid] = Proposal(title=title, proposer=gl.message.sender_address)
        self.proposal_ids.append(pid)
        self.proposal_count += 1
        return pid

    @gl.public.write
    def vote(self, pid: int, approve: bool) -> None:
        p = self.proposals[pid]
        if approve:
            p.votes_for += 1
        else:
            p.votes_against += 1
        self.proposals[pid] = p

    @gl.public.write
    def finalize_proposal(self, pid: int) -> None:
        # TODO: get the proposal, raise if not PENDING
        # TODO: set status to APPROVED or REJECTED based on vote tally
        # TODO: save updated proposal back to self.proposals
        pass

    @gl.public.write
    def execute_proposal(self, pid: int) -> None:
        # TODO: get the proposal, raise if not APPROVED
        # TODO: set status to EXECUTED
        # TODO: save updated proposal back
        pass`,
  task: "Implement `finalize_proposal()` to transition PENDING proposals to APPROVED or REJECTED based on votes, and `execute_proposal()` to transition APPROVED proposals to EXECUTED.",
  hints: [
    "In `finalize_proposal`: `p = self.proposals[pid]; if p.status != PENDING: raise gl.vm.UserError('not pending')`.",
    "Decide outcome: `p.status = APPROVED if p.votes_for > p.votes_against else REJECTED` — then `self.proposals[pid] = p`.",
    "In `execute_proposal`: check `p.status != APPROVED` and raise, then set `p.status = EXECUTED` and save.",
  ],
};

export default content;
