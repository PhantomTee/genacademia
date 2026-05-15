import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 27,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 27 — Upgradable Contracts: Set Mediator and Version Tracking

Production contracts need to evolve without redeployment. A common pattern is to store the address of a **mediator contract** that handles disputed logic, and update it as governance improves. A **version counter** provides auditability — anyone can tell how many times the mediator has been rotated.

### Mediator Contract Pattern

The mediator is a separate contract that arbitrates disputes using more sophisticated logic than a coin flip. The escrow stores its address and can be pointed at a new mediator without touching any other state.

\`\`\`python
mediator_contract: Address
version: int

@gl.public.write
def set_mediator(self, new_mediator: Address) -> None:
    if gl.message.sender_address != self.client:
        raise gl.vm.UserError("only client can set mediator")
    zero = Address("0x0000000000000000000000000000000000000000")
    if new_mediator == zero:
        raise gl.vm.UserError("mediator cannot be zero address")
    self.mediator_contract = new_mediator
    self.version += 1
\`\`\`

### Version Tracking

Incrementing \`self.version\` every time the mediator changes gives a transparent audit trail. Any external observer can call \`get_version()\` and know how many times the mediator was rotated.

### Zero Address Guard

Accepting the zero address as a mediator would silently break dispute resolution. Always reject it explicitly.

### Initialising New State

Add to \`__init__\`:

\`\`\`python
self.mediator_contract = Address("0x0000000000000000000000000000000000000000")
self.version = 0
\`\`\``,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass

OPEN = "OPEN"
AWARDED = "AWARDED"
WORK_SUBMITTED = "WORK_SUBMITTED"
COMPLETE = "COMPLETE"
DISPUTED = "DISPUTED"

ZERO_ADDRESS = Address("0x0000000000000000000000000000000000000000")


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
    mediator_contract: Address
    version: int

    def __init__(self, title: str, budget: u256, reputation_contract: Address) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.escrow_amount = u256(0)
        self.is_open = True
        self.status = OPEN
        self.applicant_count = 0
        self.applications = TreeMap[Address, Application]()
        self.awarded_to = ZERO_ADDRESS
        self.deliverable_url = ""
        self.profile_index = gl.VectorStorage()
        self.reputation_contract = reputation_contract
        self.mediator_contract = ZERO_ADDRESS
        self.version = 0

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
    def raise_dispute(self) -> None:
        if gl.message.sender_address not in (self.client, self.awarded_to):
            raise gl.vm.UserError("only client or freelancer can raise dispute")
        if self.status != WORK_SUBMITTED:
            raise gl.vm.UserError("can only dispute after work submission")
        self.status = DISPUTED

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
        return int(gl.call_contract(self.reputation_contract, "get_score", [addr]))

    @gl.public.write.payable
    def full_award_and_fund(self, freelancer: Address) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can award")
        if self.status != OPEN:
            raise gl.vm.UserError("job is not open")
        if self.applications.get(freelancer, None) is None:
            raise gl.vm.UserError("applicant not found")
        if gl.message.value == 0:
            raise gl.vm.UserError("must send GEN to fund escrow")
        self.awarded_to = freelancer
        self.escrow_amount = gl.message.value
        self.status = AWARDED

    @gl.public.write
    def random_arbitration(self) -> None:
        if self.status != DISPUTED:
            raise gl.vm.UserError("not in dispute")
        roll = gl.get_random_u8()
        if roll < 128:
            gl.send(self.awarded_to, self.escrow_amount)
        else:
            gl.send(self.client, self.escrow_amount)
        self.escrow_amount = u256(0)
        self.status = COMPLETE

    @gl.public.write
    def set_mediator(self, new_mediator: Address) -> None:
        pass  # TODO: check sender == client, reject zero address, update mediator_contract, increment version

    @gl.public.view
    def get_version(self) -> int:
        pass  # TODO: return self.version
`,
  task: "Implement `set_mediator()`: only the client may call it; reject the zero address with a UserError; update `self.mediator_contract` to `new_mediator` and increment `self.version`. Implement `get_version()` to return `self.version`.",
  hints: [
    "Ownership check: `if gl.message.sender_address != self.client: raise gl.vm.UserError('only client can set mediator')`.",
    "Zero address guard: `if new_mediator == ZERO_ADDRESS: raise gl.vm.UserError('mediator cannot be zero address')`. Then `self.mediator_contract = new_mediator` and `self.version += 1`.",
    "`get_version` is one line: `return self.version`.",
  ],
};

export default content;
