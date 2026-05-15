import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 22 — gl.send: Releasing the Escrowed Payment

The escrow only matters when money actually moves. \`gl.send(address, amount)\` transfers GEN tokens from the contract's balance to any address — the final step in a trustless payment flow.

### gl.send Signature

\`\`\`python
gl.send(recipient: Address, amount: u256) -> None
\`\`\`

The contract must hold at least \`amount\` wei or the transaction will revert. The send is atomic: if anything else in the method raises an error, the transfer is rolled back.

### Access Control Pattern

Payment release must be protected by two guards:

1. **Caller check** — only the client who created the escrow should be able to release funds.
2. **State check** — funds should only move when both parties have agreed the work is done (\`COMPLETE\` status).

\`\`\`python
@gl.public.write
def release_payment(self) -> None:
    if gl.message.sender_address != self.client:
        raise gl.vm.UserError("only client can release payment")
    if self.status != COMPLETE:
        raise gl.vm.UserError("job is not complete")
    gl.send(self.awarded_to, self.escrow_amount)
\`\`\`

### Why Status Matters

Without a status check a malicious client could call \`release_payment\` before the freelancer has even started, draining the escrow to a fraudulent awarded address. The state machine enforces the correct workflow: OPEN → AWARDED → WORK_SUBMITTED → COMPLETE.

### After the Send

After calling \`gl.send\` it is good practice to zero out \`self.escrow_amount\` to prevent double-spend vulnerabilities — a pattern called the **checks-effects-interactions** principle.`,
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

    def __init__(self, title: str, budget: u256) -> None:
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
        pass  # TODO: check caller == client and status == COMPLETE, then gl.send
`,
  task: "Implement `release_payment()` so that only the client can call it when the job status is COMPLETE. It should transfer `self.escrow_amount` to `self.awarded_to` using `gl.send`, then zero out `self.escrow_amount`.",
  hints: [
    "Guard with two checks: sender must be the client, and status must equal COMPLETE. Raise `gl.vm.UserError` for either violation.",
    "`gl.send(address, amount)` transfers tokens out of the contract. Pass `self.awarded_to` and `self.escrow_amount` as arguments.",
    "Full solution: `if gl.message.sender_address != self.client: raise gl.vm.UserError('only client can release payment')` / `if self.status != COMPLETE: raise gl.vm.UserError('job is not complete')` / `gl.send(self.awarded_to, self.escrow_amount)` / `self.escrow_amount = u256(0)`.",
  ],
};

export default content;
