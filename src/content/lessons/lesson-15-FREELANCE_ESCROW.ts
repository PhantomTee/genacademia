import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 15 — Capstone: Full Data Structures Contract

This capstone consolidates the TreeMap, dataclass, and state machine into a single contract that exposes clean view methods for a frontend to consume.

### View Methods for Status

\`\`\`python
@gl.public.view
def get_status(self) -> str:
    return self.status

@gl.public.view
def get_awarded_freelancer(self) -> str:
    return str(self.awarded_to)
\`\`\`

These simple getters let any caller inspect the contract's current phase without modifying state.

### State Transition Checklist

By this point every state-changing method should enforce its preconditions:

| Method | Required status | Caller |
|---|---|---|
| \`apply\` | OPEN | any |
| \`award_job\` | OPEN | client |
| \`submit_work\` | AWARDED | awarded freelancer |
| \`accept_work\` | WORK_SUBMITTED | client |
| \`raise_dispute\` | WORK_SUBMITTED | client |

### Adding accept_work and raise_dispute

Complete the lifecycle by adding:

- \`accept_work()\`: client accepts deliverables → status becomes COMPLETE.
- \`raise_dispute()\`: client rejects work → status becomes DISPUTED.

Both require \`status == WORK_SUBMITTED\` and \`caller == client\`.

After this lesson TrustLance has a fully correct lifecycle that feeds into the payment and arbitration features ahead.`,
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

    @gl.public.view
    def get_status(self) -> str:
        pass  # TODO: return self.status

    @gl.public.view
    def get_awarded_freelancer(self) -> str:
        pass  # TODO: return str(self.awarded_to)

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
        if self.status != AWARDED:
            raise gl.vm.UserError("job not yet awarded")
        if gl.message.sender_address != self.awarded_to:
            raise gl.vm.UserError("not the hired freelancer")
        self.deliverable_url = deliverable_url
        self.status = WORK_SUBMITTED

    @gl.public.write
    def accept_work(self) -> None:
        pass  # TODO: require status==WORK_SUBMITTED and caller==client; set status=COMPLETE

    @gl.public.write
    def raise_dispute(self) -> None:
        pass  # TODO: require status==WORK_SUBMITTED and caller==client; set status=DISPUTED
`,
  task: "Implement `get_status()` and `get_awarded_freelancer()` as simple view methods. Implement `accept_work()` (transitions WORK_SUBMITTED → COMPLETE) and `raise_dispute()` (transitions WORK_SUBMITTED → DISPUTED), both gated to the client.",
  hints: [
    "`get_status` returns `self.status`; `get_awarded_freelancer` returns `str(self.awarded_to)`.",
    "Both `accept_work` and `raise_dispute` need: check `self.status == WORK_SUBMITTED` and `gl.message.sender_address == self.client`.",
    "`accept_work` sets `self.status = COMPLETE`; `raise_dispute` sets `self.status = DISPUTED`.",
  ],
};

export default content;
