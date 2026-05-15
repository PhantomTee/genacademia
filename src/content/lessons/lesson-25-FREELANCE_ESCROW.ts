import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 25,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 25 — Capstone: Atomic Award and Fund in One Transaction

Lessons 21–24 built the pieces separately — payable funding, contract calls, vector search. This capstone combines awarding the job *and* receiving the escrow deposit in a **single atomic transaction**. Either both operations succeed, or neither does.

### Payable Write Methods

Any \`@gl.public.write\` method can accept GEN by adding \`.payable\`:

\`\`\`python
@gl.public.write.payable
def full_award_and_fund(self, freelancer: Address) -> None:
    ...
\`\`\`

The GEN sent with the transaction is available in \`gl.message.value\` (type \`u256\`).

### The Full Award-and-Fund Pattern

\`\`\`python
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
\`\`\`

### Why Atomic Matters

If award and fund were separate transactions, a race condition could award the job without funding it, or vice versa. Combining them guarantees the freelancer is both selected and the escrow is fully funded in one step — no inconsistent intermediate state.

### Minimum Value Guard

Requiring \`gl.message.value > 0\` prevents clients from accidentally awarding a job with zero escrow. In production you might enforce a minimum equal to \`self.budget\`.`,
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
        return int(gl.call_contract(self.reputation_contract, "get_score", [addr]))

    @gl.public.write.payable
    def full_award_and_fund(self, freelancer: Address) -> None:
        pass  # TODO: validate caller, status, applicant exists, value > 0; then set awarded_to, escrow_amount, status=AWARDED
`,
  task: "Implement `full_award_and_fund()` as a payable method: verify the caller is the client, status is OPEN, the freelancer has applied, and `gl.message.value > 0`. Then set `self.awarded_to`, store `gl.message.value` as `self.escrow_amount`, and transition status to AWARDED — all in one transaction.",
  hints: [
    "Four guards in order: sender == client, status == OPEN, applicant exists in `self.applications`, and `gl.message.value == 0` raises a UserError.",
    "After all checks pass: `self.awarded_to = freelancer` and `self.escrow_amount = gl.message.value`.",
    "Final line: `self.status = AWARDED` — the state machine moves atomically only after every check succeeds.",
  ],
};

export default content;
