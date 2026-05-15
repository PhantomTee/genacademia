import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 6 — AI Evaluation with exec_prompt

GenLayer's killer feature is **non-deterministic execution**: contracts can call an LLM during a transaction, with the network reaching consensus on the result. The entry point is \`gl.nondet.exec_prompt\`.

### Calling the LLM

\`\`\`python
result = gl.nondet.exec_prompt(
    "Does this portfolio suit a web development job? Answer HIRE or PASS only.",
    response_format="text"
)
return result.strip().upper()
\`\`\`

The prompt is a plain string. \`response_format="text"\` asks for a freeform string back.

### How Consensus Works

Every validator node re-runs the prompt independently. GenLayer's consensus protocol ensures that even though LLM outputs are probabilistic, all nodes converge on the same final state. You don't need to manage this — the VM handles it.

### Building the Evaluator

\`evaluate_applicant(self, applicant: Address, portfolio_url: str) -> str\` should:

1. Build a prompt that includes the job title and portfolio URL.
2. Ask the LLM: does this freelancer fit?
3. Return "HIRE" or "PASS".

Keep the prompt focused and specific — vague prompts get inconsistent answers. Instruct the LLM to reply with exactly one word.

### Adding \`awarded_to\`

Add \`awarded_to: Address\` to state now. It will be set later when a freelancer is actually hired (Lesson 10), but declaring it early keeps the contract's shape clear.`,
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

    @gl.public.view
    def get_is_open(self) -> bool:
        return self.is_open

    @gl.public.write
    def close_applications(self) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only the client can close applications")
        self.is_open = False

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
    def evaluate_applicant(self, applicant: Address, portfolio_url: str) -> str:
        pass  # TODO: call gl.nondet.exec_prompt asking if portfolio fits the job title; return "HIRE" or "PASS"
`,
  task: "Implement `evaluate_applicant()` to call `gl.nondet.exec_prompt` with a prompt that mentions `self.title` and `portfolio_url`, instructing the LLM to reply with HIRE or PASS. Return the stripped, uppercased result.",
  hints: [
    "`gl.nondet.exec_prompt(prompt, response_format='text')` calls the LLM and returns a string.",
    "Build a clear prompt: `f'Job: {self.title}\\nPortfolio: {portfolio_url}\\nReply HIRE or PASS only.'`",
    "Return `result.strip().upper()` to normalise the LLM's response.",
  ],
};

export default content;
