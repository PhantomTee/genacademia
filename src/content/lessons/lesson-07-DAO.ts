import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "DAO",
  explanation: `## Lesson 7 — Structured AI Output with response_format="json"

Returning a plain "APPROVE" or "REJECT" string is a start, but real governance benefits from richer AI output. In this lesson you upgrade \`ai_evaluate_proposal\` to return a structured dictionary with the decision, the AI's reasoning, and a confidence score.

### response_format="json"

When you pass \`response_format="json"\` to \`exec_prompt\`, GenLayer instructs the LLM to return valid JSON and automatically parses it into a Python \`dict\`. No manual \`json.loads()\` required.

\`\`\`python
result: dict = gl.nondet.exec_prompt(prompt, response_format="json")
decision = result["decision"]    # "APPROVE" or "REJECT"
confidence = result["confidence"] # 0–100
\`\`\`

### Prompt for Structured Output

You must tell the LLM exactly what keys to include and what format each value should take. A clear prompt schema reduces malformed responses:

\`\`\`
Return a JSON object with exactly these keys:
- "decision": "APPROVE" or "REJECT"
- "reasoning": a single sentence explaining your decision
- "confidence": an integer 0-100 representing your certainty
\`\`\`

### Why Structured Output Matters

The confidence score enables threshold-based acceptance — only proposals the AI is at least 65% confident about proceed (introduced in L10). The reasoning field creates an on-chain audit trail: members can see exactly why the AI approved or rejected a proposal, making the governance process transparent and trustable.

### Return Type

Update the method signature to return \`dict\` instead of \`str\`. The caller (or a view wrapper) can inspect any key they need.`,
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

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.view
    def get_member_count(self) -> int:
        return self.member_count

    @gl.public.write
    def join(self) -> None:
        if self.members.get(gl.message.sender_address, False):
            raise gl.vm.UserError("already a member")
        if self.member_count >= 1000:
            raise gl.vm.UserError("DAO is full")
        self.members[gl.message.sender_address] = True
        self.member_count += 1

    @gl.public.write
    def ai_evaluate_proposal(self, title: str, description: str) -> dict:
        # TODO: build a prompt that asks for JSON with keys:
        #   "decision" (APPROVE/REJECT), "reasoning" (str), "confidence" (0-100)
        # TODO: call gl.nondet.exec_prompt(prompt, response_format="json")
        # TODO: increment proposal_count and return the dict
        pass`,
  task: "Update `ai_evaluate_proposal()` to use `response_format='json'` and return a dict with keys `decision`, `reasoning`, and `confidence`.",
  hints: [
    "Add `response_format='json'` as a second argument to `gl.nondet.exec_prompt(prompt, response_format='json')`.",
    "Instruct the LLM in your prompt to return exactly these keys: `decision` (APPROVE/REJECT), `reasoning` (one sentence), `confidence` (0-100 integer).",
    "The return value is already a dict — just `return result` after incrementing `self.proposal_count`.",
  ],
};

export default content;
