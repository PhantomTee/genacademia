import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 16 — run_nondet_unsafe: Leader/Validator Pattern

\`exec_prompt\` handles consensus automatically, but sometimes you need fine-grained control — for example when the leader does expensive work (fetching a URL + calling the LLM) and validators should do something lighter. GenLayer provides \`gl.vm.run_nondet_unsafe\` for this.

### The Pattern

\`\`\`python
result = gl.vm.run_nondet_unsafe(
    leader_fn,    # Callable[[], T] — runs on the leader node
    validator_fn  # Callable[[T], bool] — runs on every validator
)
\`\`\`

- **Leader** does the heavy lifting: fetches data, calls LLM, builds the result.
- **Validator** receives the leader's result and returns \`True\` if it looks legitimate, \`False\` to reject.

### Why Separate?

Validators don't need to re-run expensive LLM calls. They only need to check that the result *could plausibly be correct* — structure checks, range checks, sanity checks. This makes validation cheap while keeping the leader honest.

### Example Split

\`\`\`python
def _leader_eval(self, url: str) -> dict:
    content = gl.nondet.web.get(url)[:2000]
    return gl.nondet.exec_prompt(
        f"Job: {self.title}\\nContent: {content}\\nReturn JSON...",
        response_format="json"
    )

def _validate_eval(self, r) -> bool:
    return isinstance(r, dict) and "score" in r
\`\`\`

The unsafe suffix is a reminder that you are responsible for writing a correct validator.`,
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
        pass  # TODO: fetch url, call exec_prompt with response_format="json", return result

    def _validate_eval(self, r) -> bool:
        pass  # TODO: return True if r is a dict with "score" key

    @gl.public.write
    def evaluate_applicant(self, applicant: Address) -> dict:
        app = self.applications.get(applicant, None)
        if app is None:
            raise gl.vm.UserError("applicant not found")
        url = app.portfolio_url
        # TODO: replace direct exec_prompt with gl.vm.run_nondet_unsafe(leader, validator)
        result = gl.nondet.exec_prompt(
            f"Job: {self.title}\\nURL: {url}\\nReturn JSON: hire bool, reason str, score int",
            response_format="json"
        )
        app.score = result.get("score", 0)
        self.applications[applicant] = app
        return result
`,
  task: "Implement `_leader_eval(self, url)` to fetch the URL and call `exec_prompt` for JSON, and `_validate_eval(self, r)` to check the result is a dict with a `score` key. Update `evaluate_applicant()` to use `gl.vm.run_nondet_unsafe`.",
  hints: [
    "`_leader_eval` should do: `content = gl.nondet.web.get(url)[:2000]` then `return gl.nondet.exec_prompt(prompt, response_format='json')`.",
    "`_validate_eval` returns `isinstance(r, dict) and 'score' in r`.",
    "In `evaluate_applicant`, replace the direct call with: `result = gl.vm.run_nondet_unsafe(lambda: self._leader_eval(url), lambda r: self._validate_eval(r))`.",
  ],
};

export default content;
