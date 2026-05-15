import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 3 — Input Validation & UserError

A prediction market that accepts any string as an outcome is broken — PredictX should only allow \`"YES"\` or \`"NO"\` bets. Validating inputs before mutating state is a core smart-contract discipline: once bad data is written on-chain, it cannot be undone.

GenLayer provides \`gl.vm.UserError\` for communicating user-visible errors back to the caller. Raising it rolls back the entire transaction, so no state changes persist.

\`\`\`python
@gl.public.write
def place_bet(self, outcome: str) -> None:
    if outcome not in ["YES", "NO"]:
        raise gl.vm.UserError("outcome must be YES or NO")
    self.bet_count += 1
    self.last_bettor = gl.message.sender_address
\`\`\`

Always validate **before** mutating state. If you incremented \`bet_count\` first and then raised an error, the increment would be rolled back anyway — but the pattern of "validate first, write second" is cleaner and easier to audit.

This same pattern will protect every mutating method in PredictX: only the owner can cancel, only a resolved market can pay out, and only valid outcomes can be bet on.`,
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
        # TODO: raise gl.vm.UserError if outcome is not "YES" or "NO"
        self.bet_count += 1
        self.last_bettor = gl.message.sender_address

    @gl.public.view
    def get_bet_count(self) -> int:
        return self.bet_count
`,
  task: "Add validation to `place_bet()` that raises `gl.vm.UserError` if the outcome is not `\"YES\"` or `\"NO\"`.",
  hints: [
    "Always validate inputs before modifying any state — raises roll back the whole transaction.",
    "Use `raise gl.vm.UserError(\"message\")` to return a user-visible error to the caller.",
    "`if outcome not in [\"YES\", \"NO\"]: raise gl.vm.UserError(\"outcome must be YES or NO\")`",
  ],
};

export default content;
