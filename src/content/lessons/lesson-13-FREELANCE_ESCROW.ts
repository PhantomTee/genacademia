import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 13 — Address Ownership Transfer

Sometimes a client needs to hand off control of a contract — perhaps selling the job posting or delegating to a team member. \`transfer_client\` lets the current client designate a new owner.

### Why Ownership Transfer Is Tricky

- **Only the current client can transfer** — otherwise anyone could hijack the contract.
- **The zero address is an invalid destination** — transferring to the null address would permanently lock the contract since no-one controls the zero address.
- **Address comparison** uses \`==\` in Python. \`Address\` objects support equality natively.

### Implementation Pattern

\`\`\`python
@gl.public.write
def transfer_client(self, new_client: Address) -> None:
    if gl.message.sender_address != self.client:
        raise gl.vm.UserError("only client can transfer")
    if new_client == Address("0x0000000000000000000000000000000000000000"):
        raise gl.vm.UserError("cannot transfer to zero address")
    self.client = new_client
\`\`\`

### Protecting Subsequent Operations

After transfer, \`close_applications\`, \`award_job\`, and \`release_payment\` all check \`self.client\` — so the new owner automatically gains full privileges while the old one loses them. No individual method needs to be updated.

This single-slot ownership model is the simplest safe pattern. More complex multi-sig schemes build on this foundation.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


@dataclass
class Application:
    bio: str
    portfolio_url: str
    score: int = 0


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    is_open: bool
    status: str
    applicant_count: int
    applications: TreeMap[Address, Application]
    awarded_to: Address

    def __init__(self, title: str, budget: u256) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.is_open = True
        self.status = "OPEN"
        self.applicant_count = 0
        self.applications = TreeMap[Address, Application]()

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.view
    def get_client(self) -> str:
        return str(self.client)

    @gl.public.write
    def transfer_client(self, new_client: Address) -> None:
        pass  # TODO: check caller == client; reject zero address; set self.client = new_client

    @gl.public.write
    def apply(self, bio: str, portfolio_url: str) -> None:
        if not bio:
            raise gl.vm.UserError("bio required")
        if self.applications.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already applied")
        self.applications[gl.message.sender_address] = Application(bio=bio, portfolio_url=portfolio_url)
        self.applicant_count += 1

    @gl.public.view
    def get_applicant_count(self) -> int:
        return self.applicant_count
`,
  task: "Implement `transfer_client()`: raise `gl.vm.UserError` if the caller is not the current client or if `new_client` is the zero address, then update `self.client = new_client`.",
  hints: [
    "Ownership check: `if gl.message.sender_address != self.client: raise gl.vm.UserError('only client can transfer')`.",
    "Zero address check: compare `new_client` to `Address('0x0000000000000000000000000000000000000000')`.",
    "If both checks pass, simply assign: `self.client = new_client`.",
  ],
};

export default content;
