import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "DAO",
  explanation: `## Lesson 20 — Capstone: run_nondet_unsafe with Visual AI Evaluation

This capstone lesson upgrades GovMind's AI evaluator to the most powerful pattern in GenLayer: combining \`web.get\`, \`web.render\`, and \`exec_prompt\` with images — all inside \`gl.vm.run_nondet_unsafe\`.

### Why run_nondet_unsafe?

Plain \`exec_prompt\` calls work for simple text prompts, but they don't give you control over the leader/validator split. \`run_nondet_unsafe\` lets you write two distinct functions:

- **Leader function** — fetches data, renders pages, calls the LLM, and returns a result.
- **Validator function** — checks the result is structurally valid *without re-running* the expensive computation.

This separation is essential when your leader does multi-step work (fetch + screenshot + LLM with images), because validators cannot cost the same as the leader.

### The Leader: Full Multi-Modal Pipeline

\`\`\`python
def _leader_eval(self, pid: int) -> dict:
    p = self.proposals[pid]
    page_text = gl.nondet.web.get(p.ref_url)
    screenshot = gl.nondet.web.render(p.ref_url)
    prompt = (
        f"Evaluate the proposal '{p.title}'.\\n"
        f"Page text (truncated): {page_text[:1000]}\\n"
        "Return JSON: decision (APPROVE/REJECT), confidence (0-100), reasoning (str)."
    )
    return gl.nondet.exec_prompt(prompt, response_format="json", images=[screenshot])
\`\`\`

### The Validator: Non-Comparative Structure Check

\`\`\`python
def _validate_eval(self, result) -> bool:
    if not isinstance(result, dict):
        return False
    if result.get("decision") not in ("APPROVE", "REJECT"):
        return False
    c = result.get("confidence", -1)
    return isinstance(c, int) and 0 <= c <= 100
\`\`\`

### Wiring It All Together

\`\`\`python
result = gl.vm.run_nondet_unsafe(
    lambda: self._leader_eval(pid),
    lambda r: self._validate_eval(r)
)
\`\`\`

The result is stored on the proposal. This is the production-grade AI evaluation pattern for GovMind.`,
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
    description: str
    ref_url: str
    proposer: Address
    status: str = "PENDING"
    votes_for: int = 0
    votes_against: int = 0
    executed: bool = False

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    proposal_count: int
    members: TreeMap[Address, bool]
    proposals: TreeMap[int, Proposal]

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, Proposal]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    def _leader_eval(self, pid: int) -> dict:
        # TODO: get the proposal from self.proposals[pid]
        # TODO: fetch page text with gl.nondet.web.get(p.ref_url)
        # TODO: render screenshot with gl.nondet.web.render(p.ref_url)
        # TODO: build a prompt including title, page_text[:1000], and ask for JSON
        # TODO: call exec_prompt with response_format="json" and images=[screenshot]
        pass

    def _validate_eval(self, result) -> bool:
        # TODO: check result is dict
        # TODO: check result["decision"] in ("APPROVE", "REJECT")
        # TODO: check confidence is int 0-100
        # TODO: return True only if all pass
        pass

    @gl.public.write
    def ai_evaluate_proposal(self, pid: int) -> dict:
        # TODO: call gl.vm.run_nondet_unsafe with _leader_eval and _validate_eval
        # TODO: store result["decision"] as proposal.status
        # TODO: return the result dict
        pass`,
  task: "Implement `_leader_eval()` to fetch the proposal's ref_url with web.get and web.render, call exec_prompt with images, then implement `_validate_eval()` for non-comparative structure checking, and wire both into `ai_evaluate_proposal()` via `run_nondet_unsafe`.",
  hints: [
    "In `_leader_eval`: get the proposal, call `gl.nondet.web.get(p.ref_url)` for text and `gl.nondet.web.render(p.ref_url)` for the screenshot bytes, then pass both to `exec_prompt(..., response_format='json', images=[screenshot])`.",
    "In `_validate_eval`: return `False` if result is not a dict, if `result.get('decision') not in ('APPROVE','REJECT')`, or if confidence is not an int in 0–100. Otherwise return `True`.",
    "In `ai_evaluate_proposal`: `result = gl.vm.run_nondet_unsafe(lambda: self._leader_eval(pid), lambda r: self._validate_eval(r))` then `self.proposals[pid].status = result['decision']` and `return result`.",
  ],
};

export default content;
