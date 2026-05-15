import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 24,
  projectPath: "DAO",
  explanation: `## Lesson 24 — Contract-to-Contract Calls: Voter Token Balance

DAOs often integrate with external token contracts to enable token-weighted governance. GenLayer lets contracts call other contracts at runtime with \`gl.call_contract\`.

### gl.call_contract

\`\`\`python
result = gl.call_contract(address, method_name, args_list)
\`\`\`

- \`address\` — the \`Address\` of the target contract
- \`method_name\` — a string, the public method to call
- \`args_list\` — a list of positional arguments

The call is synchronous and returns the method's return value. If the target method raises, the exception propagates to the caller.

### Querying a Token Balance

A typical ERC-20-style token contract exposes a \`balance_of(holder: Address) -> int\` method. To get a voter's token balance:

\`\`\`python
balance = gl.call_contract(
    self.token_contract,
    "balance_of",
    [voter]
)
return int(balance)
\`\`\`

The explicit \`int()\` cast converts the returned value to a plain Python int, which is safe to use in arithmetic.

### Storing the Token Contract Address

The token contract address is stored in state and set by the admin at deploy time (or via a setter). This makes the integration configurable without redeploying the DAO:

\`\`\`python
token_contract: Address
\`\`\`

### Why Token-Weighted Governance?

One-member-one-vote is simple but ignores stakeholder investment. Token weighting means members who hold more tokens have proportionally more influence — a common pattern in DeFi governance (e.g. Compound, Uniswap).`,
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
    def get_voter_weight(self, voter: Address) -> int:
        # TODO: call self.token_contract with method "balance_of" and [voter] as args
        # TODO: return the result cast to int
        pass`,
  task: "Implement `get_voter_weight()` by calling `self.token_contract` with method `\"balance_of\"` and `[voter]` as arguments via `gl.call_contract`, returning the result as an `int`.",
  hints: [
    "`gl.call_contract` takes three arguments: the target address, the method name as a string, and a list of arguments.",
    "Call: `balance = gl.call_contract(self.token_contract, \"balance_of\", [voter])` — the voter address is passed as the sole argument in the list.",
    "Cast and return: `return int(gl.call_contract(self.token_contract, \"balance_of\", [voter]))` — the explicit `int()` converts any numeric return type to a plain Python int.",
  ],
};

export default content;
