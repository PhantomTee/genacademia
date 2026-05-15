import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 10,
  projectPath: "DAO",
  explanation: `## Lesson 10 — Capstone: Full Proposal Evaluation Pipeline

This capstone combines web fetching, AI evaluation, confidence thresholds, and proposal storage into one end-to-end governance function. \`submit_and_evaluate_proposal\` is the heart of GovMind: the first function that both thinks and remembers.

### Chaining Non-Deterministic Calls

GenLayer allows multiple non-deterministic operations in a single transaction. The order is important: fetch first, then evaluate — the AI needs the reference context to make a good decision.

\`\`\`python
page = gl.nondet.web.get(ref_url)
result = gl.nondet.exec_prompt(prompt + page[:1500], response_format="json")
\`\`\`

### Confidence Threshold

Not all AI decisions are equal. A proposal the LLM is only 40% confident about should not be automatically approved. Enforce a minimum confidence threshold of 65:

\`\`\`python
if result["confidence"] < 65:
    raise gl.vm.UserError("AI confidence too low — proposal needs revision")
\`\`\`

This design means low-confidence proposals are returned to the proposer for improvement rather than being rejected outright.

### Storing Approved Proposals

When a proposal passes the confidence threshold with decision "APPROVE", store it. For now, use a simple string map: \`self.proposals[self.proposal_count] = title\`. Later lessons will replace strings with full \`Proposal\` dataclass objects.

### Summary of the Pipeline

1. Sanitise inputs
2. Fetch reference URL (first 1500 chars)
3. AI evaluates with JSON response
4. Reject if confidence < 65
5. Store if APPROVE
6. Always increment \`proposal_count\`

This pipeline is the reference implementation you will refine over the next 20 lessons.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    proposal_count: int
    members: TreeMap[Address, bool]
    proposals: TreeMap[int, str]

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, str]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    def _sanitize(self, text: str) -> str:
        text = text.replace("\\n", " ").replace("\\r", " ")
        text = text.replace("[", "").replace("]", "")
        return text[:500]

    @gl.public.write
    def submit_and_evaluate_proposal(self, title: str, desc: str, ref_url: str) -> dict:
        # TODO: sanitize title and desc
        # TODO: fetch ref_url and truncate to 1500 chars
        # TODO: build prompt and call exec_prompt with response_format="json"
        # TODO: raise UserError if confidence < 65
        # TODO: store in self.proposals if decision == "APPROVE"
        # TODO: increment proposal_count and return result
        pass`,
  task: "Implement `submit_and_evaluate_proposal()` that fetches the reference URL, evaluates with AI (JSON), requires confidence >= 65, stores approved proposals, and increments `proposal_count`.",
  hints: [
    "Fetch and evaluate in sequence: `page = gl.nondet.web.get(ref_url)` then `result = gl.nondet.exec_prompt(prompt, response_format='json')`.",
    "Check confidence before storing: `if result['confidence'] < 65: raise gl.vm.UserError('confidence too low')`.",
    "Store on approval: `if result['decision'] == 'APPROVE': self.proposals[self.proposal_count] = safe_title` — then increment `self.proposal_count` and `return result`.",
  ],
};

export default content;
