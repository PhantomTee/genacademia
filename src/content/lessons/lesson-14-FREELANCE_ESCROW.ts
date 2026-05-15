import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 14,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 14 — State Machine: Job Lifecycle

TrustLance's job lifecycle has distinct phases. Encoding them as a **state machine** prevents illegal transitions (e.g., submitting work before being hired) and makes the contract's logic self-documenting.

### The States

\`\`\`python
OPEN          = "OPEN"           # job is accepting applications
AWARDED       = "AWARDED"        # a freelancer has been hired
WORK_SUBMITTED = "WORK_SUBMITTED" # freelancer uploaded deliverables
COMPLETE      = "COMPLETE"       # client accepted the work
DISPUTED      = "DISPUTED"       # conflict raised
\`\`\`

### Enforcing Transitions

Every state-changing method checks the current state first:

\`\`\`python
@gl.public.write
def submit_work(self, deliverable_url: str) -> None:
    if self.status != AWARDED:
        raise gl.vm.UserError("job not yet awarded")
    if gl.message.sender_address != self.awarded_to:
        raise gl.vm.UserError("not the hired freelancer")
    self.deliverable_url = deliverable_url
    self.status = WORK_SUBMITTED
\`\`\`

### Why This Matters

Without state guards, a malicious freelancer could call \`submit_work\` before being hired, or \`release_payment\` could be called in the disputed state. The state machine is the contract's trust boundary.

### New Field

Add \`deliverable_url: str\` to store the link to submitted work. Initialise to \`""\` in the constructor.`,
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
        self.is_open = True
        self.status = OPEN
        self.applicant_count = 0
        self.applications = TreeMap[Address, Application]()
        self.deliverable_url = ""

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.write
    def apply(self, bio: str, portfolio_url: str) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("applications closed")
        if not bio:
            raise gl.vm.UserError("bio required")
        if self.applications.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already applied")
        self.applications[gl.message.sender_address] = Application(bio=bio, portfolio_url=portfolio_url)
        self.applicant_count += 1

    @gl.public.write
    def award_job(self, freelancer: Address) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client")
        if self.status != OPEN:
            raise gl.vm.UserError("not open")
        self.awarded_to = freelancer
        self.status = AWARDED

    @gl.public.write
    def submit_work(self, deliverable_url: str) -> None:
        pass  # TODO: require status==AWARDED and caller==awarded_to; store url; set status=WORK_SUBMITTED
`,
  task: "Implement `submit_work()`: raise `gl.vm.UserError` if status is not `AWARDED` or caller is not `self.awarded_to`, then store `deliverable_url` and set `self.status = WORK_SUBMITTED`.",
  hints: [
    "Check state: `if self.status != AWARDED: raise gl.vm.UserError('job not yet awarded')`.",
    "Check identity: `if gl.message.sender_address != self.awarded_to: raise gl.vm.UserError('not the hired freelancer')`.",
    "Then: `self.deliverable_url = deliverable_url` and `self.status = WORK_SUBMITTED`.",
  ],
};

export default content;
