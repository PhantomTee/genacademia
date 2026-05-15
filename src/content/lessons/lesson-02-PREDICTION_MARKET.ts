import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 2 — @gl.public.write & State Mutation

Now that users can read the market question, they need a way to participate. In PredictX, placing a bet is the first write operation: we record that someone called \`place_bet\` and track how many bets have been placed.

Methods that **change** on-chain state must be decorated with \`@gl.public.write\`. Without that decorator, any attempt to modify state will be rejected by the runtime.

\`\`\`python
@gl.public.write
def place_bet(self, outcome: str) -> None:
    self.bet_count += 1
    self.last_bettor = gl.message.sender_address
\`\`\`

\`gl.message.sender_address\` gives you the \`Address\` of whoever called the method — the on-chain equivalent of \`msg.sender\` in Solidity. You can store it, compare it, and later use it to authorise payouts.

View methods still work the same way — \`get_bet_count\` is a pure read that returns the current counter without touching any state.

By the end of this lesson PredictX can accept bets and report how many have been placed — a critical first step before adding amounts, outcomes, and payouts in later lessons.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address


class PredictionMarket(gl.Contract):
    question: str
    bet_count: int
    last_bettor: Address

    def __init__(self, question: str) -> None:
        self.question = question
        self.bet_count = 0

    @gl.public.view
    def get_question(self) -> str:
        return self.question

    @gl.public.write
    def place_bet(self, outcome: str) -> None:
        pass

    @gl.public.view
    def get_bet_count(self) -> int:
        pass
`,
  task: "Implement `place_bet()` to increment `bet_count` and store the caller's address in `last_bettor`, then implement `get_bet_count()` to return the current count.",
  hints: [
    "Write methods need `@gl.public.write` — already applied here. Inside, modify `self` state freely.",
    "`gl.message.sender_address` returns the `Address` of the current caller — assign it to `self.last_bettor`.",
    "`self.bet_count += 1` increments the counter; `get_bet_count` just needs `return self.bet_count`.",
  ],
};

export default content;
