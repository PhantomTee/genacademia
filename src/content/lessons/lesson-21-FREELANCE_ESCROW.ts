import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 21,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 21 — Payable Methods and Escrow Funding

An escrow that never holds real money is just a spreadsheet. This lesson introduces **payable methods** — functions that accept GEN (GenLayer's native token) sent alongside the call.

### Payable Decorator

\`\`\`python
@gl.public.write.payable
def fund_escrow(self) -> None:
    self.escrow_amount += gl.message.value
\`\`\`

\`gl.message.value\` is a \`u256\` representing the wei sent with this transaction. If no value is sent it is \`0\`.

### Separate Funding from Deployment

The constructor cannot easily be payable in all GenLayer setups, so a clean pattern is to deploy the contract first and then call \`fund_escrow()\` as a separate transaction. This also allows the client to top up the escrow later.

### Tracking Escrow Amount

Add \`escrow_amount: u256\` to state, initialised to \`0\`. Every call to \`fund_escrow\` adds the sent value:

\`\`\`python
def __init__(self, title: str, budget: u256) -> None:
    ...
    self.escrow_amount = u256(0)
\`\`\`

### Security Note

Only allow the client to fund the escrow — otherwise a third party could send tokens and complicate the payout logic. Add an ownership check inside \`fund_escrow\`.`,
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
        self.deliverable_url = ""

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.view
    def get_escrow_amount(self) -> int:
        return int(self.escrow_amount)

    @gl.public.write.payable
    def fund_escrow(self) -> None:
        pass  # TODO: require caller == client; add gl.message.value to self.escrow_amount
`,
  task: "Implement `fund_escrow()`: raise `gl.vm.UserError` if the caller is not the client, then add `gl.message.value` to `self.escrow_amount`.",
  hints: [
    "Ownership check first: `if gl.message.sender_address != self.client: raise gl.vm.UserError('only client can fund')`.",
    "`gl.message.value` is the wei sent with the transaction — it is of type `u256`.",
    "Add to escrow: `self.escrow_amount += gl.message.value`.",
  ],
};

export default content;
