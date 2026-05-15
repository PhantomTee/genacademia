import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 28,
  projectPath: "DAO",
  explanation: `## Lesson 28 — Debugging with gl.emit_debug

Even on-chain, you need visibility into what your contract is doing. GenLayer's \`gl.emit_debug\` lets you log messages from contract methods — visible in the simulator and devtools, stripped from production execution.

### gl.emit_debug

\`\`\`python
gl.emit_debug("message here")
\`\`\`

The argument is any string. You can format it with f-strings to include runtime values:

\`\`\`python
gl.emit_debug(f"Member joined: {caller}, treasury now {int(self.treasury)}")
\`\`\`

### When to Use emit_debug

Place debug emissions at **key state transitions** — the moments where something important just happened:

| Method | Good emit_debug placement |
|--------|--------------------------|
| \`join\` | After membership is confirmed |
| \`submit_proposal\` | After proposal is stored |
| \`weighted_vote\` | After vote is recorded |
| \`execute_proposal\` | After execution completes |

### What to Include

Good debug messages include:
- **Who**: the sender address
- **What**: the action taken (joined, submitted, voted)
- **Key values**: pid, vote counts, treasury balance

### Production Behaviour

\`emit_debug\` calls are ignored (no-op) in production deployments. They add zero overhead to mainnet execution. Use them freely during development — you never need to remove them.

### Debugging Strategy

Add debug lines at the start and end of complex methods to trace the flow, and include intermediate values that might be wrong during testing. The GenLayer simulator surfaces all debug messages in a transaction's execution trace.`,
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
        # TODO: emit_debug logging member joined with caller and new member_count

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
        # TODO: emit_debug logging proposal submitted with pid, title, and proposer
        return pid

    @gl.public.write
    def execute_proposal(self, pid: int) -> None:
        if gl.message.sender_address != self.admin:
            raise gl.vm.UserError("Admin only")
        proposal = self.proposals.get(pid)
        if proposal is None:
            raise gl.vm.UserError("Proposal not found")
        if proposal.status != APPROVED:
            raise gl.vm.UserError("Proposal not approved")
        if proposal.executed:
            raise gl.vm.UserError("Already executed")
        proposal.executed = True
        proposal.status = EXECUTED
        # TODO: emit_debug logging proposal executed with pid, title, and proposer`,
  task: "Add `gl.emit_debug(...)` calls to `join()`, `submit_proposal()`, and `execute_proposal()` to log key governance events including the sender address, proposal id where relevant, and treasury or vote counts.",
  hints: [
    "In `join`: `gl.emit_debug(f'Member joined: {caller}, total members: {self.member_count}, treasury: {int(self.treasury)}')`.",
    "In `submit_proposal`: `gl.emit_debug(f'Proposal {pid} submitted by {caller}: \"{title}\"')`.",
    "In `execute_proposal`: `gl.emit_debug(f'Proposal {pid} (\"{proposal.title}\") executed, proposer: {proposal.proposer}')`.",
  ],
};

export default content;
