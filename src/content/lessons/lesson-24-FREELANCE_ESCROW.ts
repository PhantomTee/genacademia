import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 24,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 24 — Contract-to-Contract Calls: Reputation Check

No smart contract is an island. \`gl.call_contract\` lets your escrow query any other deployed contract — enabling composable on-chain systems where contracts collaborate rather than duplicate logic.

### gl.call_contract

\`\`\`python
result = gl.call_contract(address, method_name, [arg1, arg2, ...])
\`\`\`

- **address** — the \`Address\` of the target contract.
- **method_name** — a string matching a public method on the target.
- **args** — a Python list of arguments in the same order the method expects.

The call is synchronous within the transaction; the return value is whatever the target method returns.

### Reputation Contract Pattern

A dedicated reputation contract stores scores for every freelancer across all platforms. Instead of each escrow contract computing scores itself, it delegates:

\`\`\`python
@gl.public.view
def get_freelancer_score(self, addr: Address) -> int:
    return int(gl.call_contract(self.reputation_contract, "get_score", [addr]))
\`\`\`

### Storing the Reputation Contract Address

Add \`reputation_contract: Address\` to state. The client passes it at deploy time:

\`\`\`python
def __init__(self, title: str, budget: u256, reputation_contract: Address) -> None:
    ...
    self.reputation_contract = reputation_contract
\`\`\`

### Why Delegate?

- A single reputation contract becomes the source of truth across all TrustLance escrows.
- Scores update once and all escrows immediately reflect the new value.
- You get composability for free — no data duplication.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass

OPEN = "OPEN"
AWARDED = "AWARDED"
WORK_SUBMITTED = "WORK_SUBMITTED"
COMPLETE = "COMPLETE"
DISPUTED = "DISPUTED"


@dataclass
class Application:
    bio: str
    portfolio_url: str
    score: int = 0
    approved: bool = False


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    escrow_amount: u256
    is_open: bool
    status: str
    applicant_count: int
    applications: TreeMap[Address, Application]
    awarded_to: Address
    deliverable_url: str
    profile_index: gl.VectorStorage
    reputation_contract: Address

    def __init__(self, title: str, budget: u256, reputation_contract: Address) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.escrow_amount = u256(0)
        self.is_open = True
        self.status = OPEN
        self.applicant_count = 0
        self.applications = TreeMap[Address, Application]()
        self.awarded_to = Address("0x0000000000000000000000000000000000000000")
        self.deliverable_url = ""
        self.profile_index = gl.VectorStorage()
        self.reputation_contract = reputation_contract

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.view
    def get_escrow_amount(self) -> int:
        return int(self.escrow_amount)

    @gl.public.write.payable
    def fund_escrow(self) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can fund")
        self.escrow_amount += gl.message.value

    @gl.public.write
    def apply(self, bio: str, portfolio_url: str) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("job is not open")
        addr = gl.message.sender_address
        if self.applications.get(addr, None) is not None:
            raise gl.vm.UserError("already applied")
        self.applications[addr] = Application(bio=bio, portfolio_url=portfolio_url)
        self.applicant_count += 1
        self.profile_index.add(bio, {"applicant": str(addr)})

    @gl.public.write
    def award_job(self, freelancer: Address) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can award")
        if self.status != OPEN:
            raise gl.vm.UserError("job is not open")
        if self.applications.get(freelancer, None) is None:
            raise gl.vm.UserError("applicant not found")
        self.awarded_to = freelancer
        self.status = AWARDED

    @gl.public.write
    def submit_work(self, deliverable_url: str) -> None:
        if gl.message.sender_address != self.awarded_to:
            raise gl.vm.UserError("only awarded freelancer can submit")
        if self.status != AWARDED:
            raise gl.vm.UserError("job is not awarded")
        self.deliverable_url = deliverable_url
        self.status = WORK_SUBMITTED

    @gl.public.write
    def approve_work(self) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can approve")
        if self.status != WORK_SUBMITTED:
            raise gl.vm.UserError("work has not been submitted")
        self.status = COMPLETE

    @gl.public.write
    def release_payment(self) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can release payment")
        if self.status != COMPLETE:
            raise gl.vm.UserError("job is not complete")
        gl.send(self.awarded_to, self.escrow_amount)
        self.escrow_amount = u256(0)

    @gl.public.view
    def find_freelancers(self, query: str) -> list:
        results = self.profile_index.search(query, top_k=5)
        return [r[1] for r in results]

    @gl.public.view
    def get_freelancer_score(self, addr: Address) -> int:
        pass  # TODO: call self.reputation_contract with method "get_score" and [addr]
`,
  task: "Implement `get_freelancer_score()` by calling `self.reputation_contract` via `gl.call_contract` with method `\"get_score\"` and the address as the sole argument. Cast the result to `int` before returning.",
  hints: [
    "`gl.call_contract` takes three arguments: the target address, the method name as a string, and a list of positional arguments.",
    "Pass the freelancer address inside a list as the third argument: `gl.call_contract(self.reputation_contract, \"get_score\", [addr])`.",
    "Full solution: `return int(gl.call_contract(self.reputation_contract, \"get_score\", [addr]))`.",
  ],
};

export default content;
