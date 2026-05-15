import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 17,
  projectPath: "DAO",
  explanation: `## Lesson 17 — Non-Comparative Validation

In Lesson 16 you wrote \`_validate_eval\` as a simple key-check. This lesson formalises the **non-comparative validation** principle, which is critical for safe non-deterministic contracts.

### What is Non-Comparative Validation?

When validators check a leader's result, they should verify **structural plausibility** — not independently reproduce the result. Re-running the LLM on every validator node would:
1. Cost far more gas
2. Potentially get different answers (LLMs are stochastic)
3. Make consensus impossible

The non-comparative approach says: "I don't need to re-run the computation. I just need to verify the result is structurally valid."

### A Robust _validate_eval

\`\`\`python
def _validate_eval(self, result) -> bool:
    if not isinstance(result, dict):
        return False
    if result.get("decision") not in ("APPROVE", "REJECT"):
        return False
    confidence = result.get("confidence", -1)
    if not isinstance(confidence, int) or not (0 <= confidence <= 100):
        return False
    if "reasoning" not in result:
        return False
    return True
\`\`\`

### What This Checks

- **Type check**: result is a dict (not a string, int, or None)
- **Decision validity**: decision is exactly "APPROVE" or "REJECT"
- **Confidence range**: an integer from 0 to 100 inclusive
- **Required keys**: reasoning field exists

### What This Does NOT Check

The validator never asks "is this the right decision?" — that would require re-running the LLM. It only asks "is this a valid decision format?"

This principle applies to any non-deterministic operation in GenLayer: validate structure, not semantics.`,
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
        page = gl.nondet.web.get(ref_url)
        prompt = f"""Evaluate this proposal for {self.name}.
Title: {title}
Reference: {page[:1500]}
Return JSON with keys: decision (APPROVE/REJECT), reasoning (str), confidence (0-100 int)."""
        return gl.nondet.exec_prompt(prompt, response_format="json")

    def _validate_eval(self, result) -> bool:
        # TODO: check result is a dict
        # TODO: check result["decision"] is "APPROVE" or "REJECT"
        # TODO: check result["confidence"] is an int between 0 and 100
        # TODO: check "reasoning" key exists
        # TODO: return True only if all checks pass
        pass

    @gl.public.write
    def ai_evaluate_proposal(self, title: str, ref_url: str) -> dict:
        result = gl.vm.run_nondet_unsafe(
            lambda: self._leader_eval(title, ref_url),
            lambda r: self._validate_eval(r)
        )
        self.proposal_count += 1
        return result`,
  task: "Implement `_validate_eval()` to check non-comparatively: the result is a dict, `decision` is 'APPROVE' or 'REJECT', `confidence` is an integer 0–100, and `reasoning` key exists.",
  hints: [
    "Start with a type check: `if not isinstance(result, dict): return False`.",
    "Check decision: `if result.get('decision') not in ('APPROVE', 'REJECT'): return False`.",
    "Check confidence: `c = result.get('confidence', -1); if not isinstance(c, int) or not (0 <= c <= 100): return False` — then check reasoning and `return True`.",
  ],
};

export default content;
