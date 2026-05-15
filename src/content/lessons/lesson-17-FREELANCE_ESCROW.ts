import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 17,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 17 — Non-Comparative Validation

The validator in \`run_nondet_unsafe\` must **not** re-run the LLM — that defeats the purpose. Instead it performs *non-comparative equivalence*: it checks that the leader's result is structurally plausible, without caring about the exact value.

### What Non-Comparative Means

The validator does NOT ask: "Is this the same answer I would get?" It asks: "Is this answer within the space of valid answers?"

For TrustLance's evaluation:
- \`score\` should be an integer between 0 and 100.
- \`hire\` should be a boolean.
- \`reason\` should be a non-empty string.

If all three checks pass, the result is legitimate regardless of which specific score the leader chose.

### Implementation

\`\`\`python
def _validate_eval(self, r) -> bool:
    if not isinstance(r, dict):
        return False
    score = r.get("score")
    hire = r.get("hire")
    reason = r.get("reason", "")
    return (
        isinstance(score, int) and 0 <= score <= 100
        and isinstance(hire, bool)
        and isinstance(reason, str) and len(reason) > 0
    )
\`\`\`

### Why This Is Sufficient

A validator that just checks ranges can't be gamed (a leader would have to produce an out-of-range value to cheat, which the validator would catch). The score distribution naturally converges across nodes because the same LLM model is used everywhere.`,
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

    def _leader_eval(self, url: str) -> dict:
        content = gl.nondet.web.get(url)[:2000]
        prompt = (
            f"Job: {self.title}\\nPortfolio content: {content}\\n"
            'Return JSON: {"hire": bool, "reason": str, "score": 0-100}'
        )
        return gl.nondet.exec_prompt(prompt, response_format="json")

    def _validate_eval(self, r) -> bool:
        # TODO: check r is a dict; score is int 0-100; hire is bool; reason is non-empty str
        pass

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
  task: "Complete `_validate_eval(self, r) -> bool` to check: `r` is a dict, `r['score']` is an int between 0 and 100, `r['hire']` is a bool, and `r['reason']` is a non-empty string.",
  hints: [
    "Start with `if not isinstance(r, dict): return False`.",
    "Check the score: `score = r.get('score'); if not isinstance(score, int) or not (0 <= score <= 100): return False`.",
    "Check hire and reason: `isinstance(r.get('hire'), bool) and isinstance(r.get('reason', ''), str) and len(r.get('reason', '')) > 0`.",
  ],
};

export default content;
