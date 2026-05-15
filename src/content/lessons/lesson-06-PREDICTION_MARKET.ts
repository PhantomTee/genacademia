import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 6 — gl.nondet.exec_prompt

PredictX needs to resolve itself automatically. Rather than relying on a human oracle, we use GenLayer's killer feature: **non-deterministic execution**. \`gl.nondet.exec_prompt\` sends a prompt to an LLM and returns the answer — and GenLayer's consensus mechanism ensures all validators agree on the result.

\`\`\`python
@gl.public.write
def resolve(self) -> None:
    prompt = "Has ETH exceeded $10,000 by December 31, 2025? Answer YES or NO only."
    self.resolution = gl.nondet.exec_prompt(prompt).strip().upper()
\`\`\`

The call looks like a normal Python function, but under the hood the leader node runs the LLM and validators check the result meets your equivalence criteria. For text-format prompts, the default equivalence is string equality after normalisation.

A few prompt-writing rules to live by:
- Keep prompts short and unambiguous.
- Ask for a specific format ("Answer YES or NO only").
- \`.strip().upper()\` normalises the response so "yes", " YES ", and "YES" all store identically.

This is the core of what makes GenLayer contracts "intelligent" — the ability to resolve real-world questions with AI, on-chain, with cryptographic consensus.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256


class PredictionMarket(gl.Contract):
    question: str
    bet_count: int
    last_bettor: Address
    owner: Address
    market_id: u256
    is_open: bool
    resolution: str

    def __init__(self, question: str, market_id: u256) -> None:
        self.question = question
        self.bet_count = 0
        self.owner = gl.message.sender_address
        self.market_id = market_id
        self.is_open = True
        self.resolution = ""

    @gl.public.view
    def get_question(self) -> str:
        return self.question

    @gl.public.view
    def get_owner(self) -> str:
        return str(self.owner)

    @gl.public.write
    def place_bet(self, outcome: str) -> None:
        if outcome not in ["YES", "NO"]:
            raise gl.vm.UserError("outcome must be YES or NO")
        self.bet_count += 1
        self.last_bettor = gl.message.sender_address

    @gl.public.view
    def get_bet_count(self) -> int:
        return self.bet_count

    @gl.public.write
    def cancel(self) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        if not self.is_open:
            raise gl.vm.UserError("already cancelled")
        self.is_open = False

    @gl.public.write
    def resolve(self) -> None:
        pass
`,
  task: "Implement `resolve()` to call `gl.nondet.exec_prompt` asking whether ETH exceeded $10,000 by December 31, 2025, then store the stripped, uppercased result in `self.resolution`.",
  hints: [
    "`gl.nondet.exec_prompt(prompt)` calls an LLM and returns a string — keep the prompt short and ask for a clear format.",
    "A good prompt: `\"Has ETH exceeded $10,000 by December 31, 2025? Answer YES or NO only.\"`",
    "`self.resolution = gl.nondet.exec_prompt(prompt).strip().upper()` stores a normalised YES or NO.",
  ],
};

export default content;
