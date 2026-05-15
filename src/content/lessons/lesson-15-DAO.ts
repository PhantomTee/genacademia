import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "DAO",
  explanation: `## Lesson 15 — Capstone: Full Governance Data Structure

This capstone wraps up the core data layer of GovMind. You have a complete \`Proposal\` dataclass with status, a state machine that enforces valid transitions, and a \`TreeMap\` for storage. Now you add the two view methods that governance UIs need to display proposal dashboards.

### get_proposal_status

Governance dashboards need to know whether a proposal is pending, approved, or executed. This view reads directly from the stored proposal object:

\`\`\`python
@gl.public.view
def get_proposal_status(self, pid: int) -> str:
    return self.proposals[pid].status
\`\`\`

### get_vote_count

Vote tallies are the most queried data in any governance UI. Rather than exposing the raw Proposal object (which exposes internal details), a purpose-built view returns just the tally as a dict:

\`\`\`python
@gl.public.view
def get_vote_count(self, pid: int) -> dict:
    p = self.proposals[pid]
    return {"for": p.votes_for, "against": p.votes_against}
\`\`\`

### State Machine Correctness Review

Before adding more features, verify the state machine is sound:
- New proposals start as \`PENDING\`
- \`finalize_proposal\` only works on \`PENDING\` proposals
- \`execute_proposal\` only works on \`APPROVED\` proposals
- No method sets status back to an earlier state

If all four conditions hold, the state machine is correct and no invalid state transition is possible.

### Building on This Foundation

The next lessons add AI evaluation (\`run_nondet_unsafe\`), payable membership fees, cross-contract calls, and more. All of them build on the data structure you have assembled across Lessons 11–15.`,
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

    @gl.public.view
    def get_proposal_status(self, pid: int) -> str:
        pass

    @gl.public.view
    def get_vote_count(self, pid: int) -> dict:
        pass

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
        p = self.proposals[pid]
        if p.status != PENDING:
            raise gl.vm.UserError("not pending")
        p.status = APPROVED if p.votes_for > p.votes_against else REJECTED
        self.proposals[pid] = p

    @gl.public.write
    def execute_proposal(self, pid: int) -> None:
        p = self.proposals[pid]
        if p.status != APPROVED:
            raise gl.vm.UserError("not approved")
        p.status = EXECUTED
        self.proposals[pid] = p`,
  task: "Implement `get_proposal_status(pid)` returning the proposal's status string, and `get_vote_count(pid)` returning `{'for': votes_for, 'against': votes_against}`.",
  hints: [
    "`get_proposal_status`: `return self.proposals[pid].status` — direct attribute access on the stored Proposal object.",
    "`get_vote_count`: `p = self.proposals[pid]` then `return {'for': p.votes_for, 'against': p.votes_against}`.",
    "Both are pure reads — no mutation needed, just read and return.",
  ],
};

export default content;
