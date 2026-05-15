import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 30,
  projectPath: "DAO",
  explanation: `## Lesson 30 — Final Capstone: Ship GovMind

Congratulations — you've built a full on-chain governance DAO from scratch. This final lesson adds one last method: \`get_dao_summary()\`, a convenient view that returns all key DAO metrics in a single call.

### get_dao_summary

A summary method is invaluable for dashboards, explorers, and frontend integrations. Instead of making five separate view calls, callers get everything in one round-trip:

\`\`\`python
@gl.public.view
def get_dao_summary(self) -> dict:
    return {
        "name": self.name,
        "admin": str(self.admin),
        "member_count": self.member_count,
        "treasury": int(self.treasury),
        "proposal_count": self.proposal_count,
    }
\`\`\`

### Type Conversions

- **Address → str**: Use \`str(self.admin)\` — raw \`Address\` values are not JSON-serialisable.
- **u256 → int**: Use \`int(self.treasury)\` — \`u256\` is a GenLayer-specific type; plain \`int\` works in JSON.
- **int fields**: \`member_count\` and \`proposal_count\` are already plain Python ints — no conversion needed.

### What You've Built

Over 30 lessons you built GovMind from an empty contract to a production-quality DAO with:

| Feature | Lesson |
|---------|--------|
| Basic state and views | 1–5 |
| Members and proposals | 6–10 |
| Voting and execution | 11–15 |
| AI evaluation (exec_prompt) | 16–17 |
| Multi-modal AI (web.render + images) | 18–20 |
| Payable membership fees | 21 |
| Treasury payouts (gl.send) | 22 |
| Semantic search (VectorStorage) | 23 |
| Token-weighted voting | 24–25 |
| Randomness tie-breaking | 26 |
| Upgradable evaluator | 27 |
| Debugging | 28 |
| Special receive methods | 29 |
| Summary view | 30 |

GovMind is ready to deploy.`,
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
        gl.emit_debug(f"Member joined: {caller}, total members: {self.member_count}, treasury: {int(self.treasury)}")

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
        gl.emit_debug(f"Proposal {pid} submitted by {caller}: \\"{title}\\"")
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
    def set_evaluator(self, new_evaluator: Address) -> None:
        if gl.message.sender_address != self.admin:
            raise gl.vm.UserError("Admin only")
        if new_evaluator == Address(0):
            raise gl.vm.UserError("Invalid address")
        self.evaluator_contract = new_evaluator
        self.version += 1

    @gl.public.view
    def get_version(self) -> int:
        return self.version

    def __receive_value__(self, amount: u256) -> None:
        self.treasury += amount

    def __receive_message__(self, message: str) -> None:
        if message == "treasury_balance":
            gl.emit_debug(f"Treasury: {int(self.treasury)}")
        elif message == "member_count":
            gl.emit_debug(f"Members: {self.member_count}")

    @gl.public.view
    def get_dao_summary(self) -> dict:
        # TODO: return a dict with keys: name, admin (str), member_count, treasury (int), proposal_count
        pass`,
  task: "Implement `get_dao_summary()` to return a dict with `name` (str), `admin` (str via `str()`), `member_count` (int), `treasury` (int via `int()`), and `proposal_count` (int).",
  hints: [
    "Return a plain Python dict — no special types needed. All values should be JSON-serialisable primitives.",
    "Convert the Address to a string: `'admin': str(self.admin)` and the u256 to int: `'treasury': int(self.treasury)`.",
    "Complete implementation: `return {'name': self.name, 'admin': str(self.admin), 'member_count': self.member_count, 'treasury': int(self.treasury), 'proposal_count': self.proposal_count}`.",
  ],
};

export default content;
