import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 29,
  projectPath: "DAO",
  explanation: `## Lesson 29 — Special Methods: Receiving Value and Messages

GenLayer contracts can react to two kinds of incoming signals beyond regular method calls: plain GEN transfers and raw string messages. These are handled by two special methods.

### __receive_value__

Called automatically when GEN is sent to the contract address without calling any specific method:

\`\`\`python
def __receive_value__(self, amount: u256) -> None:
    self.treasury += amount
\`\`\`

This makes the contract a valid GEN recipient. Without this method, direct transfers to the contract address are rejected.

### __receive_message__

Called when a raw string message is sent to the contract:

\`\`\`python
def __receive_message__(self, message: str) -> None:
    if message == "treasury_balance":
        gl.emit_debug(f"Treasury: {int(self.treasury)}")
\`\`\`

This is useful for lightweight queries or control signals that don't require a full method ABI call. Think of it as a text-based RPC interface.

### Practical Uses in GovMind

**__receive_value__**: Allows the DAO to receive donations or grants from other contracts and wallets. Any GEN sent directly top-up the treasury automatically.

**__receive_message__**: Enables a simple query protocol. Operators can send known strings to trigger debug responses or lightweight state reads without calling a full view method.

### Message Parsing

For richer message handling, parse the string:

\`\`\`python
def __receive_message__(self, message: str) -> None:
    if message == "treasury_balance":
        gl.emit_debug(f"Treasury: {int(self.treasury)}")
    elif message == "member_count":
        gl.emit_debug(f"Members: {self.member_count}")
\`\`\``,
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

    def __receive_value__(self, amount: u256) -> None:
        # TODO: add amount to self.treasury
        pass

    def __receive_message__(self, message: str) -> None:
        # TODO: if message == "treasury_balance", emit_debug the treasury value
        # TODO: if message == "member_count", emit_debug the member_count
        pass`,
  task: "Implement `__receive_value__` to add the received GEN to `self.treasury`, and implement `__receive_message__` to handle `\"treasury_balance\"` by emitting the current treasury and `\"member_count\"` by emitting the member count.",
  hints: [
    "`__receive_value__` receives the transferred amount directly: `self.treasury += amount`.",
    "`__receive_message__` receives a plain string — use `if message == 'treasury_balance':` to match known commands.",
    "Full `__receive_message__`: `if message == 'treasury_balance': gl.emit_debug(f'Treasury: {int(self.treasury)}')` and `elif message == 'member_count': gl.emit_debug(f'Members: {self.member_count}')`.",
  ],
};

export default content;
