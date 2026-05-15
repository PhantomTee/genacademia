import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 10,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 10 — Capstone: Full AI-Powered Job Award

This capstone combines web fetching, JSON evaluation, score thresholds, and state transitions into a complete \`award_job\` flow.

### The Complete Award Pipeline

\`\`\`python
@gl.public.write
def award_job(self, freelancer: Address) -> None:
    # 1. Fetch portfolio
    portfolio_url = ...  # from applications map (added in L11; use a param for now)
    content = gl.nondet.web.get(portfolio_url)[:2000]

    # 2. AI evaluation
    result = gl.nondet.exec_prompt(prompt, response_format="json")

    # 3. Score threshold
    if result["score"] < 70:
        raise gl.vm.UserError("freelancer score too low")

    # 4. State transition
    self.awarded_to = freelancer
    self.status = "AWARDED"
\`\`\`

### Why a Score Threshold?

A binary HIRE / PASS is subjective. A numeric score (0–100) lets the contract enforce an **objective** minimum bar — removing the client's discretion for the automated path. Here we require ≥ 70.

### Ownership & State Checks

Only the client can award the job, and only when the contract is still open (\`is_open == True\`). Adding these guards first ensures the pipeline never runs unnecessarily.

### Adding \`status\`

Introduce \`status: str\` now (initialised to \`"OPEN"\`). This string will drive the full state machine in Lesson 14. Setting it to \`"AWARDED"\` here is the first transition.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    is_open: bool
    status: str
    applicant_count: int
    last_applicant: Address
    awarded_to: Address

    def __init__(self, title: str, budget: u256) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.is_open = True
        self.status = "OPEN"
        self.applicant_count = 0

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.write
    def apply(self, bio: str) -> None:
        if not bio:
            raise gl.vm.UserError("bio required")
        if self.last_applicant == gl.message.sender_address:
            raise gl.vm.UserError("already applied")
        self.applicant_count += 1
        self.last_applicant = gl.message.sender_address

    def _safe_text(self, text: str) -> str:
        clean = text.replace("\\n", " ").replace("\\r", " ")
        for ch in ["[", "]", "{", "}"]:
            clean = clean.replace(ch, "")
        return clean[:500]

    @gl.public.write
    def award_job(self, freelancer: Address, portfolio_url: str) -> None:
        # TODO: require caller == client and is_open == True
        # TODO: fetch portfolio_url with gl.nondet.web.get, truncate to 2000 chars
        # TODO: call exec_prompt with response_format="json" for score/hire fields
        # TODO: require result["score"] >= 70, else raise UserError
        # TODO: set self.awarded_to = freelancer and self.status = "AWARDED"
        pass
`,
  task: "Implement `award_job()`: verify caller is the client and job is open, fetch the freelancer's portfolio, get an AI JSON score, require score >= 70, then set `self.awarded_to` and `self.status = 'AWARDED'`.",
  hints: [
    "Guard first: `if gl.message.sender_address != self.client: raise gl.vm.UserError('not client')`; also check `self.is_open`.",
    "Chain the calls: `content = gl.nondet.web.get(portfolio_url)[:2000]` then `result = gl.nondet.exec_prompt(prompt, response_format='json')`.",
    "Score gate: `if result['score'] < 70: raise gl.vm.UserError('score too low')`. Then set `self.awarded_to = freelancer` and `self.status = 'AWARDED'`.",
  ],
};

export default content;
