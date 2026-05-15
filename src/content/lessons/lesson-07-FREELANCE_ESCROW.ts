import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 7 — Structured JSON Responses

A plain "HIRE" / "PASS" string is useful, but the client deserves richer information. GenLayer's \`exec_prompt\` supports \`response_format="json"\`, which instructs the LLM to return a structured JSON object that the VM automatically parses into a Python dict.

### Requesting JSON

\`\`\`python
result = gl.nondet.exec_prompt(prompt, response_format="json")
# result is now a dict
score = result["score"]
\`\`\`

### Schema-Driven Prompting

The LLM doesn't enforce a schema on its own — you must describe it in the prompt. A clear schema definition dramatically improves reliability:

\`\`\`
Respond with JSON only, using this exact schema:
{
  "hire": <true or false>,
  "reason": "<one sentence explanation>",
  "score": <integer 0-100>
}
\`\`\`

### What Each Field Means

- **hire** — boolean decision: should the client hire this freelancer?
- **reason** — human-readable explanation shown in the UI.
- **score** — numeric confidence (0–100) used later for automated thresholds.

### Returning the Dict

Because \`evaluate_applicant\` now returns a dict, update the return type annotation to \`dict\`. The caller can read \`result["hire"]\` to make automated decisions or display \`result["reason"]\` in the job board UI.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    is_open: bool
    applicant_count: int
    last_applicant: Address
    awarded_to: Address

    def __init__(self, title: str, budget: u256) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.is_open = True
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

    @gl.public.view
    def get_applicant_count(self) -> int:
        return self.applicant_count

    @gl.public.write
    def evaluate_applicant(self, applicant: Address, portfolio_url: str) -> dict:
        # TODO: build a prompt that requests JSON with keys: hire (bool), reason (str), score (0-100)
        # TODO: call gl.nondet.exec_prompt with response_format="json" and return the result dict
        pass
`,
  task: "Update `evaluate_applicant()` to use `response_format='json'`. The prompt must instruct the LLM to return JSON with keys `hire` (bool), `reason` (str), and `score` (0–100). Return the parsed dict.",
  hints: [
    "Add `response_format='json'` as the second argument to `gl.nondet.exec_prompt`.",
    "Include the JSON schema in the prompt text so the LLM knows exactly what fields to produce.",
    "The function returns the dict directly — `result = gl.nondet.exec_prompt(prompt, response_format='json'); return result`.",
  ],
};

export default content;
