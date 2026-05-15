import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 18,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 18 — web.render: Screenshots from URLs

\`gl.nondet.web.get\` returns raw HTML text. For visual evaluation of a portfolio you want an actual rendered screenshot — something the LLM can interpret visually. \`gl.nondet.web.render\` does exactly that.

### API

\`\`\`python
screenshot: bytes = gl.nondet.web.render("https://example.com/portfolio")
\`\`\`

The returned value is PNG image bytes. You can store it, pass it to \`exec_prompt\` with the \`images=[]\` parameter, or return it directly from a view method for the frontend to display.

### How It Works Under Consensus

Every validator node renders the URL independently using a headless browser. GenLayer reconciles the results — minor pixel-level differences are handled by the consensus protocol. The meaningful content (layout, text, design) is stable enough to be consistent.

### Practical Considerations

- Rendering takes more time than a plain HTTP GET.
- Very dynamic pages (heavy JavaScript) may look different between renders; prefer stable portfolio pages.
- Truncation is irrelevant for images — you pass the full bytes to the LLM.

### Adding get_portfolio_screenshot

\`\`\`python
@gl.public.write
def get_portfolio_screenshot(self, url: str) -> bytes:
    return gl.nondet.web.render(url)
\`\`\`

This method is a building block for the multi-modal evaluator in Lesson 19.`,
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
    def get_portfolio_screenshot(self, url: str) -> bytes:
        pass  # TODO: render the URL and return image bytes

    def _leader_eval(self, url: str) -> dict:
        content = gl.nondet.web.get(url)[:2000]
        prompt = (
            f"Job: {self.title}\\nPortfolio content: {content}\\n"
            'Return JSON: {"hire": bool, "reason": str, "score": 0-100}'
        )
        return gl.nondet.exec_prompt(prompt, response_format="json")

    def _validate_eval(self, r) -> bool:
        if not isinstance(r, dict):
            return False
        score = r.get("score")
        return (
            isinstance(score, int) and 0 <= score <= 100
            and isinstance(r.get("hire"), bool)
            and isinstance(r.get("reason", ""), str)
        )

    @gl.public.write
    def evaluate_applicant(self, applicant: Address) -> dict:
        app = self.applications.get(applicant, None)
        if app is None:
            raise gl.vm.UserError("applicant not found")
        url = app.portfolio_url
        result = gl.vm.run_nondet_unsafe(
            lambda: self._leader_eval(url),
            lambda r: self._validate_eval(r)
        )
        app.score = result.get("score", 0)
        self.applications[applicant] = app
        return result
`,
  task: "Implement `get_portfolio_screenshot(self, url: str) -> bytes` to call `gl.nondet.web.render(url)` and return the resulting image bytes.",
  hints: [
    "`gl.nondet.web.render(url)` renders the page in a headless browser and returns PNG bytes.",
    "The implementation is a single line: `return gl.nondet.web.render(url)`.",
    "This method uses `@gl.public.write` because non-deterministic calls require write context in GenLayer.",
  ],
};

export default content;
