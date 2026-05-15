import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 19,
  projectPath: "DAO",
  explanation: `## Lesson 19 — Multi-Modal AI: Images in exec_prompt

In Lesson 18 you captured a screenshot with \`web.render\`. Now you pass that image directly to the LLM using \`exec_prompt\`'s \`images\` parameter — enabling **multi-modal AI evaluation** where the LLM reasons about both text and visuals.

### exec_prompt with Images

\`exec_prompt\` accepts an optional \`images\` parameter: a list of \`bytes\` objects. The LLM receives the image(s) alongside the text prompt and can describe, analyse, or reason about what it sees.

\`\`\`python
screenshot: bytes = gl.nondet.web.render(url)
verdict: str = gl.nondet.exec_prompt(
    "Does this screenshot look like a legitimate open-source project? Answer YES or NO.",
    images=[screenshot]
)
\`\`\`

### visual_assess_proposal

This lesson adds \`visual_assess_proposal(pid, screenshot_url)\`:

1. Look up the proposal by \`pid\` (to get its title for context)
2. Render the screenshot URL
3. Ask the LLM if the page looks like a legitimate proposal

This gives the DAO a lightweight visual sanity-check: spam proposals or placeholder pages are likely to fail the visual test even if their text description sounds reasonable.

### Combining Text and Image Context

For the best results, your prompt should include both text context and the image:

\`\`\`python
prompt = f"Evaluate: does this screenshot represent a legitimate project proposal for '{title}'? Answer YES or NO with one sentence of reasoning."
\`\`\`

Multi-modal evaluation is a powerful capability unique to GenLayer — traditional smart contracts have no way to reason about images or other binary data.`,
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

    @gl.public.write
    def visual_assess_proposal(self, pid: int, screenshot_url: str) -> str:
        # TODO: get the proposal title from self.proposals[pid]
        # TODO: render the screenshot_url with web.render → bytes
        # TODO: build a prompt asking if it looks like a legitimate proposal
        # TODO: call exec_prompt(prompt, images=[screenshot]) and return the result
        pass`,
  task: "Implement `visual_assess_proposal()` to render the screenshot URL, pass the image to `exec_prompt` with a text prompt about the proposal's legitimacy, and return the LLM's verdict.",
  hints: [
    "Get the proposal title: `p = self.proposals[pid]` then `title = p.title`.",
    "Render: `screenshot = gl.nondet.web.render(screenshot_url)` — this returns bytes.",
    "Call: `return gl.nondet.exec_prompt(f'Does this screenshot represent a legitimate proposal titled \"{title}\"? Answer YES or NO.', images=[screenshot])`.",
  ],
};

export default content;
