import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "DAO",
  explanation: `## Lesson 16 — run_nondet_unsafe: Leader and Validator Roles

GenLayer's consensus model assigns one validator as the **leader** (who produces the result) and the rest as **validators** (who verify it). \`gl.vm.run_nondet_unsafe\` gives you explicit control over this split — the leader function runs once to produce a result, and the validator function checks that result on every other node.

### Why run_nondet_unsafe?

Plain \`exec_prompt\` re-runs the LLM call on every validator, which is expensive. For complex tasks — like fetching a URL and calling an LLM — you want the leader to do the expensive work and validators to just check the output format.

### The API

\`\`\`python
result = gl.vm.run_nondet_unsafe(
    leader_fn,    # callable that produces the result (runs once, on leader)
    validator_fn  # callable(result) -> bool (runs on all validators)
)
\`\`\`

Both arguments are callables. The simplest form uses lambdas:

\`\`\`python
result = gl.vm.run_nondet_unsafe(
    lambda: self._leader_eval(title, ref_url),
    lambda r: self._validate_eval(r)
)
\`\`\`

### _leader_eval

This private method does the expensive work: fetch the reference URL, build a prompt, call \`exec_prompt\` with JSON mode, and return the dict.

### _validate_eval

This private method receives the leader's result and returns \`True\` if it looks valid. It should NOT re-run the LLM — just check structural properties (correct keys, values in range, etc.).

Separating concerns this way reduces gas costs and network load while maintaining safety guarantees.`,
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

    def _leader_eval(self, title: str, ref_url: str) -> dict:
        # TODO: fetch ref_url with web.get, truncate to 1500 chars
        # TODO: build prompt with title and page content
        # TODO: call exec_prompt with response_format="json" and return dict
        pass

    def _validate_eval(self, result) -> bool:
        # TODO: return True if result has "decision" and "confidence" keys
        pass

    @gl.public.write
    def ai_evaluate_proposal(self, title: str, ref_url: str) -> dict:
        # TODO: call gl.vm.run_nondet_unsafe with _leader_eval and _validate_eval
        # TODO: increment proposal_count and return result
        pass`,
  task: "Implement `_leader_eval()` (fetch URL + exec_prompt JSON), `_validate_eval()` (check result structure), and wire them together in `ai_evaluate_proposal()` using `gl.vm.run_nondet_unsafe`.",
  hints: [
    "In `_leader_eval`: `page = gl.nondet.web.get(ref_url)` then build prompt and `return gl.nondet.exec_prompt(prompt, response_format='json')`.",
    "In `_validate_eval`: `return isinstance(result, dict) and 'decision' in result and 'confidence' in result`.",
    "In `ai_evaluate_proposal`: `result = gl.vm.run_nondet_unsafe(lambda: self._leader_eval(title, ref_url), lambda r: self._validate_eval(r))` then increment and return.",
  ],
};

export default content;
