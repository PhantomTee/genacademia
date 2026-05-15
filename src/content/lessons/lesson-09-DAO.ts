import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "DAO",
  explanation: `## Lesson 9 — Fetching Web Context with gl.nondet.web.get

Proposal evaluation improves dramatically when the AI can read supporting evidence. GenLayer's \`gl.nondet.web.get(url)\` fetches a web page and returns its content as a string — letting your contract pull live external data before making a decision.

### gl.nondet.web.get

\`\`\`python
content: str = gl.nondet.web.get("https://github.com/example/proposal.md")
\`\`\`

Like \`exec_prompt\`, \`web.get\` is non-deterministic. The GenLayer consensus mechanism ensures all validators agree on the result before it is committed on-chain. You write it synchronously; the network handles the consensus.

### Why Include a Reference URL?

Proposals often link to external documentation: a GitHub issue, a forum thread, a whitepaper. Without fetching that content, the AI only has the title and description — a narrow context. Fetching the reference URL gives the LLM the full picture, reducing incorrect decisions.

### Responsible Truncation

Web pages can be very long. Including 50 000 tokens of HTML in a prompt is wasteful and expensive. Always truncate to a reasonable window — 1500 characters captures the most relevant lede content for most documentation pages:

\`\`\`python
page_content = gl.nondet.web.get(reference_url)
prompt_context = page_content[:1500]
\`\`\`

### Updated Prompt Structure

Include the fetched content clearly labelled so the LLM knows it is supplementary evidence:

\`\`\`
Reference material: {page_content[:1500]}
\`\`\`

This pattern — fetch, truncate, inject — is reusable for any contract that needs live web context in its decision-making.`,
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

    def _sanitize(self, text: str) -> str:
        text = text.replace("\\n", " ").replace("\\r", " ")
        text = text.replace("[", "").replace("]", "")
        return text[:500]

    @gl.public.write
    def ai_evaluate_proposal(self, title: str, description: str, reference_url: str) -> dict:
        safe_title = self._sanitize(title)
        safe_desc = self._sanitize(description)
        # TODO: fetch reference_url with gl.nondet.web.get
        # TODO: truncate to first 1500 chars
        # TODO: include content in prompt as "Reference: {content[:1500]}"
        # TODO: call exec_prompt with response_format="json" and return result dict
        pass`,
  task: "Add a `reference_url: str` parameter to `ai_evaluate_proposal()`, fetch it with `gl.nondet.web.get`, include the first 1500 characters in the LLM prompt, and return the JSON evaluation dict.",
  hints: [
    "Fetch the page: `page = gl.nondet.web.get(reference_url)` — this returns a string of the page HTML/text.",
    "Truncate before inserting into the prompt: `ref_context = page[:1500]`, then add `f'Reference: {ref_context}'` to your prompt.",
    "The rest of the method is unchanged: call `gl.nondet.exec_prompt(prompt, response_format='json')` and `return result`.",
  ],
};

export default content;
