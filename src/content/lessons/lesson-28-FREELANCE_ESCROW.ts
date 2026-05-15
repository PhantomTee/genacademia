import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 28,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 28 — Debugging with gl.emit_debug

Smart contract bugs are notoriously hard to diagnose. GenLayer provides \`gl.emit_debug(message)\` to emit structured log messages that appear in the transaction trace during development — but are **stripped in production** to keep contracts lean.

### gl.emit_debug

\`\`\`python
gl.emit_debug("some message")
gl.emit_debug(f"applicant {str(addr)} applied with score {app.score}")
\`\`\`

The argument is any string. F-strings are ideal for including dynamic state values.

### Where to Add Debug Logs

The three most important lifecycle events in TrustLance are:

1. **apply()** — log who applied and what bio length they provided.
2. **award_job()** — log the awarded freelancer address and the current escrow amount.
3. **release_payment()** — log the recipient and the amount being sent.

\`\`\`python
# in apply():
gl.emit_debug(f"new application from {str(addr)}: bio_len={len(bio)}")

# in award_job():
gl.emit_debug(f"job awarded to {str(freelancer)}, escrow={int(self.escrow_amount)}")

# in release_payment():
gl.emit_debug(f"releasing {int(self.escrow_amount)} wei to {str(self.awarded_to)}")
\`\`\`

### Production Stripping

Because \`emit_debug\` calls are removed in production builds, you can be as verbose as you like in development without any gas overhead in live deployments. Use them freely during development.

### Debugging Workflow

1. Add \`emit_debug\` calls to the critical paths.
2. Submit a transaction in the test environment.
3. Inspect the transaction trace to see all emitted messages in order.`,
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
        # TODO: emit_debug logging the applicant address and bio length

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
        # TODO: emit_debug logging the awarded address and escrow amount

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
        # TODO: emit_debug logging recipient and amount before the send
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
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can set mediator")
        if new_mediator == ZERO_ADDRESS:
            raise gl.vm.UserError("mediator cannot be zero address")
        self.mediator_contract = new_mediator
        self.version += 1

    @gl.public.view
    def get_version(self) -> int:
        return self.version
`,
  task: "Add `gl.emit_debug(...)` calls to three methods: in `apply()` log the applicant address and bio length; in `award_job()` log the awarded freelancer and current escrow amount; in `release_payment()` log the recipient address and amount being sent before calling `gl.send`.",
  hints: [
    "`gl.emit_debug` accepts any string — use an f-string for dynamic values. In `apply()`: `gl.emit_debug(f'new application from {str(addr)}: bio_len={len(bio)}')`.",
    "In `award_job()` after setting state: `gl.emit_debug(f'job awarded to {str(freelancer)}, escrow={int(self.escrow_amount)}')`.",
    "In `release_payment()` before `gl.send`: `gl.emit_debug(f'releasing {int(self.escrow_amount)} wei to {str(self.awarded_to)}')`.",
  ],
};

export default content;
