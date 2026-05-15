import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "DAO",
  explanation: `## Lesson 6 — AI Proposal Evaluation with exec_prompt

This is where GenLayer becomes truly unique. Traditional smart contracts can only evaluate proposals with rigid, hand-coded rules. GenLayer lets you call a **large language model** directly from your contract — enabling judgment that no deterministic code could replicate.

### gl.nondet.exec_prompt

\`exec_prompt\` sends a prompt to the network's configured LLM and returns the response as a string. It is part of GenLayer's **non-deterministic** execution system, which uses a consensus mechanism to ensure multiple validators agree on the result before committing it on-chain.

\`\`\`python
result: str = gl.nondet.exec_prompt("Is the sky blue? Answer YES or NO")
\`\`\`

The method is synchronous from the contract's perspective — you write it like a regular function call.

### Prompt Engineering in Contracts

The quality of AI evaluation depends heavily on the prompt. For GovMind, you must:
1. Give context: the DAO's name and purpose
2. Present the proposal: title and description
3. Constrain the output: "answer only APPROVE or REJECT"

\`\`\`python
prompt = f"""You are evaluating proposals for {self.name}, a DAO that funds open-source GenLayer tooling.
Proposal title: {title}
Description: {description}
Does this proposal benefit the DAO? Answer only: APPROVE or REJECT"""
result = gl.nondet.exec_prompt(prompt)
return result.strip().upper()
\`\`\`

### Incrementing proposal_count

Each call to \`ai_evaluate_proposal\` represents a submitted proposal. Track how many proposals have been evaluated by incrementing \`self.proposal_count\`.

This lesson unlocks the core capability that makes GovMind more than just another governance contract.`,
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
        if not self.name:
            raise gl.vm.UserError("DAO name is empty")
        if self.members.get(gl.message.sender_address, False):
            raise gl.vm.UserError("already a member")
        if self.member_count >= 1000:
            raise gl.vm.UserError("DAO is full")
        self.members[gl.message.sender_address] = True
        self.member_count += 1

    @gl.public.write
    def ai_evaluate_proposal(self, title: str, description: str) -> str:
        # TODO: build a prompt including self.name, title, and description
        # TODO: call gl.nondet.exec_prompt with the prompt
        # TODO: increment self.proposal_count
        # TODO: return the result stripped and uppercased
        pass`,
  task: "Implement `ai_evaluate_proposal()` to call `gl.nondet.exec_prompt` with a prompt asking whether the proposal benefits the DAO, returning `'APPROVE'` or `'REJECT'`.",
  hints: [
    "Build a prompt string that includes `self.name`, `title`, and `description`, then instruct the LLM to respond only with APPROVE or REJECT.",
    "Call `gl.nondet.exec_prompt(prompt)` — it returns a string. Remember to increment `self.proposal_count` before returning.",
    "Return with `return result.strip().upper()` to normalise the LLM response.",
  ],
};

export default content;
