import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 18,
  projectPath: "DAO",
  explanation: `## Lesson 18 — Visual Content with web.render

Governance proposals often include visual evidence: screenshots of a project's UI, graphs, or design mockups. GenLayer's \`gl.nondet.web.render(url)\` renders a full web page and returns the result as \`bytes\` — a screenshot image.

### gl.nondet.web.render

\`\`\`python
screenshot: bytes = gl.nondet.web.render("https://example.com/project")
\`\`\`

Like \`web.get\`, \`web.render\` is non-deterministic and participates in consensus. The leader renders the page; validators check the result. The return value is raw image bytes (typically PNG).

### When to Use web.render vs web.get

| Scenario | Use |
|----------|-----|
| Fetch text, HTML, JSON | \`web.get\` |
| Capture visual state of a page | \`web.render\` |
| Pass to LLM for image analysis | \`web.render\` |

### get_proposal_screenshot

This lesson adds a standalone view that wraps \`web.render\`:

\`\`\`python
@gl.public.write
def get_proposal_screenshot(self, url: str) -> bytes:
    return gl.nondet.web.render(url)
\`\`\`

Note: even though this is "just reading" a web page, it uses \`@gl.public.write\` because non-deterministic operations require a transaction (they must go through consensus). You cannot call \`web.render\` from a \`@gl.public.view\` method.

### Usage in the DAO

Proposal submitters can link to a live preview of their project. The DAO's admin or AI evaluator can screenshot the URL to get a visual snapshot of the project's current state, providing richer context than text alone.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap, DynArray
from dataclasses import dataclass

PENDING = "PENDING"
APPROVED = "APPROVED"
REJECTED = "REJECTED"
EXECUTED = "EXECUTED"

@dataclass
class Proposal:
    title: str
    proposer: Address
    votes_for: int = 0
    votes_against: int = 0
    status: str = "PENDING"

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    proposal_count: int
    members: TreeMap[Address, bool]
    proposals: TreeMap[int, Proposal]
    proposal_ids: DynArray[int]

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, Proposal]()
        self.proposal_ids = DynArray[int]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.write
    def get_proposal_screenshot(self, url: str) -> bytes:
        # TODO: call gl.nondet.web.render(url) and return the bytes result
        pass`,
  task: "Implement `get_proposal_screenshot()` to render the given URL using `gl.nondet.web.render` and return the resulting screenshot bytes.",
  hints: [
    "`gl.nondet.web.render(url)` renders the page and returns bytes — this is the entire implementation.",
    "The method must be `@gl.public.write` (not view) because non-deterministic calls require consensus.",
    "Full implementation: `return gl.nondet.web.render(url)`.",
  ],
};

export default content;
