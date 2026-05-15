import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 20 — Capstone: Advanced AI Evaluation

This capstone combines every AI technique from Lessons 6–19 into a single robust \`evaluate_applicant\` method: web fetch, screenshot, multi-modal LLM call, and run_nondet_unsafe with a non-comparative validator.

### The Full Leader Pipeline

\`\`\`python
def _leader_eval(self, app) -> dict:
    # 1. Fetch text content
    content = gl.nondet.web.get(app.portfolio_url)[:2000]
    # 2. Render screenshot
    screenshot = gl.nondet.web.render(app.portfolio_url)
    # 3. Combined multi-modal prompt
    prompt = (
        f"Job: {self.title}\\n"
        f"Portfolio text: {content}\\n"
        "Assess visual design and content relevance. "
        'Return JSON: {"hire": bool, "reason": str, "score": 0-100}'
    )
    return gl.nondet.exec_prompt(prompt, response_format="json", images=[screenshot])
\`\`\`

### The Validator

Non-comparative: checks structure and ranges, not exact values.

\`\`\`python
def _validate_eval(self, r) -> bool:
    return (
        isinstance(r, dict)
        and isinstance(r.get("score"), int) and 0 <= r["score"] <= 100
        and isinstance(r.get("hire"), bool)
    )
\`\`\`

### Wiring It Together

Replace the direct LLM call in \`evaluate_applicant\` with \`run_nondet_unsafe\`. The contract is now running full multi-modal AI evaluation at consensus — something not possible on any other smart contract platform.`,
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

    def _leader_eval(self, app) -> dict:
        # TODO: fetch text content (web.get, [:2000])
        # TODO: render screenshot (web.render)
        # TODO: build combined multi-modal prompt
        # TODO: call exec_prompt with response_format="json" and images=[screenshot]
        pass

    def _validate_eval(self, r) -> bool:
        # TODO: check dict, score int 0-100, hire bool
        pass

    @gl.public.write
    def evaluate_applicant(self, applicant: Address) -> dict:
        app = self.applications.get(applicant, None)
        if app is None:
            raise gl.vm.UserError("applicant not found")
        # TODO: use run_nondet_unsafe with _leader_eval and _validate_eval
        result = {}
        app.score = result.get("score", 0)
        self.applications[applicant] = app
        return result
`,
  task: "Implement `_leader_eval()` to fetch text content, render a screenshot, and call `exec_prompt` with both `response_format='json'` and `images=[screenshot]`. Implement `_validate_eval()` for non-comparative checks. Wire both into `evaluate_applicant` via `run_nondet_unsafe`.",
  hints: [
    "Leader: `content = gl.nondet.web.get(app.portfolio_url)[:2000]`; `screenshot = gl.nondet.web.render(app.portfolio_url)`; return `gl.nondet.exec_prompt(prompt, response_format='json', images=[screenshot])`.",
    "Validator: `return isinstance(r, dict) and isinstance(r.get('score'), int) and 0 <= r['score'] <= 100 and isinstance(r.get('hire'), bool)`.",
    "Wire: `result = gl.vm.run_nondet_unsafe(lambda: self._leader_eval(app), lambda r: self._validate_eval(r))`.",
  ],
};

export default content;
