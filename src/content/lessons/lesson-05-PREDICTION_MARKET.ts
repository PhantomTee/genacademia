import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 5 — CAPSTONE: PredictX Identity Contract

This capstone consolidates everything from Lessons 1–4 into a cohesive, deployable contract. PredictX now has an owner, a unique market ID, typed state, input validation, and an access-controlled \`cancel()\` method.

The \`cancel()\` method introduces two checks that will appear throughout PredictX:

1. **Ownership check** — only the deployer can cancel.
2. **State check** — you cannot cancel an already-cancelled market.

\`\`\`python
@gl.public.write
def cancel(self) -> None:
    if gl.message.sender_address != self.owner:
        raise gl.vm.UserError("unauthorized")
    if not self.is_open:
        raise gl.vm.UserError("already cancelled")
    self.is_open = False
\`\`\`

\`Address\` types support \`==\` and \`!=\` directly — no need to convert to strings for comparison. Always compare addresses this way inside write methods; string comparison would be both slower and error-prone.

After this lesson you have a solid foundation: a typed, validated, owner-gated contract that you'll extend with AI resolution, betting pools, and payouts in the lessons ahead.`,
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

    def __init__(self, question: str, market_id: u256) -> None:
        self.question = question
        self.bet_count = 0
        self.owner = gl.message.sender_address
        self.market_id = market_id
        self.is_open = True

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
        pass
`,
  task: "Implement `cancel()` so only the owner can set `self.is_open = False`, raising `UserError` for unauthorized callers or if the market is already cancelled.",
  hints: [
    "Compare `Address` types with `==`: `gl.message.sender_address != self.owner` is the ownership check.",
    "Check caller first, then check current state — two separate `if` guards, each raising `gl.vm.UserError`.",
    "`if gl.message.sender_address != self.owner: raise gl.vm.UserError(\"unauthorized\")` then `if not self.is_open: raise gl.vm.UserError(\"already cancelled\")`",
  ],
};

export default content;
