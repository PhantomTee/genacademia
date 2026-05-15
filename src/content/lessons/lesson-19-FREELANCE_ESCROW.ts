import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 19,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 19 — Multi-Modal Evaluation: Images + LLM

Reading HTML text is useful, but a client browsing portfolios cares about *visual design*. GenLayer supports multi-modal LLM calls that combine a text prompt with one or more images.

### exec_prompt with Images

\`\`\`python
screenshot = gl.nondet.web.render(url)
result = gl.nondet.exec_prompt(
    "Does this portfolio look professional? Reply YES or NO.",
    images=[screenshot]
)
\`\`\`

The \`images\` parameter accepts a list of \`bytes\` objects (PNG or JPEG). The LLM receives both the text prompt and the images together.

### visual_evaluate Method

The new \`visual_evaluate(self, applicant: Address) -> str\` method:

1. Looks up the applicant's \`portfolio_url\` from \`self.applications\`.
2. Calls \`gl.nondet.web.render\` to get a screenshot.
3. Passes the screenshot to \`exec_prompt\` alongside a question about professionalism.
4. Returns the LLM's verdict.

### Why Combine Both?

- Text evaluation catches keyword relevance (does the portfolio mention React, etc.).
- Visual evaluation catches design quality (clean layout, good typography).
- Together they give a much stronger signal than either alone — which Lesson 20's capstone will combine.`,
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
    def visual_evaluate(self, applicant: Address) -> str:
        # TODO: get applicant's portfolio_url from self.applications
        # TODO: render screenshot with gl.nondet.web.render
        # TODO: call exec_prompt with images=[screenshot] asking if portfolio looks professional
        # TODO: return the LLM verdict as a stripped string
        pass
`,
  task: "Implement `visual_evaluate()` to look up the applicant's `portfolio_url`, render it with `gl.nondet.web.render`, then call `gl.nondet.exec_prompt` with `images=[screenshot]` asking whether the portfolio looks professional. Return the stripped result.",
  hints: [
    "Retrieve the application: `app = self.applications.get(applicant, None)` and raise UserError if not found.",
    "Render: `screenshot = gl.nondet.web.render(app.portfolio_url)`.",
    "Evaluate: `return gl.nondet.exec_prompt(f'Does this portfolio look professional for a {self.title} job? Reply YES or NO.', images=[screenshot]).strip()`.",
  ],
};

export default content;
