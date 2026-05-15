import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 15 — CAPSTONE: PredictX Data Structures

You have now built all the core data structures for PredictX:

- **TreeMap** (L11) — maps each bettor \`Address\` to their \`BetRecord\`
- **BetRecord dataclass** (L12) — structured record with \`outcome\`, \`amount\`, and \`bettor\`
- **Ownership** (L13) — \`transfer_ownership\` with zero-address guard
- **State machine** (L14) — \`OPEN → RESOLVED | CANCELLED\` enforced in every write

This capstone lesson ties them together by completing the two read-only accessors that the frontend and other contracts rely on most: \`get_status()\` and \`get_resolution()\`.

Both are \`@gl.public.view\` methods — they don't modify state and cost no gas to call from off-chain tooling:

\`\`\`python
@gl.public.view
def get_status(self) -> str:
    return self.status

@gl.public.view
def get_resolution(self) -> str:
    return self.resolution
\`\`\`

Simple as they look, these accessors are the contract's public API surface. Callers don't read storage directly — they call these methods. That means you can change internal representation later (e.g., switch from strings to integers) without breaking callers as long as the return type stays consistent.

After this lesson the PredictX data-structure layer is complete. Lessons 16–20 add advanced AI consensus; lessons 21–25 add the payment layer.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass

OPEN      = "OPEN"
RESOLVED  = "RESOLVED"
CANCELLED = "CANCELLED"


@dataclass
class BetRecord:
    outcome: str
    amount: u256
    bettor: Address


class PredictionMarket(gl.Contract):
    question: str
    bet_count: int
    last_bettor: Address
    owner: Address
    market_id: u256
    status: str
    resolution: str
    confidence: int
    news_source: str
    bets: TreeMap[Address, BetRecord]

    def __init__(self, question: str, market_id: u256) -> None:
        self.question = question
        self.bet_count = 0
        self.owner = gl.message.sender_address
        self.market_id = market_id
        self.status = OPEN
        self.resolution = ""
        self.confidence = 0
        self.news_source = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        self.bets = TreeMap[Address, BetRecord]()

    @gl.public.view
    def get_question(self) -> str:
        return self.question

    @gl.public.view
    def get_owner(self) -> str:
        return str(self.owner)

    @gl.public.view
    def get_status(self) -> str:
        pass  # TODO: return self.status

    @gl.public.view
    def get_resolution(self) -> str:
        pass  # TODO: return self.resolution

    @gl.public.write
    def transfer_ownership(self, new_owner: Address) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        if new_owner == Address("0x0000000000000000000000000000000000000000"):
            raise gl.vm.UserError("cannot transfer to zero address")
        self.owner = new_owner

    @gl.public.write
    def place_bet(self, outcome: str) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        if outcome not in ["YES", "NO"]:
            raise gl.vm.UserError("outcome must be YES or NO")
        self.bet_count += 1
        self.last_bettor = gl.message.sender_address
        self.bets[gl.message.sender_address] = BetRecord(
            outcome=outcome, amount=0, bettor=gl.message.sender_address
        )

    @gl.public.view
    def get_bet_count(self) -> int:
        return self.bet_count

    @gl.public.view
    def get_bet(self, bettor: Address) -> str:
        record = self.bets.get(bettor, None)
        if record is None:
            return "NO_BET"
        return record.outcome

    @gl.public.write
    def cancel(self) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        self.status = CANCELLED

    def _safe_text(self, text: str) -> str:
        return text.replace("\\n", " ").replace("[", "").replace("]", "")

    @gl.public.write
    def resolve(self) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        data = gl.nondet.web.get(self.news_source)
        safe_q = self._safe_text(self.question)
        prompt = (
            f"Context: {data[:1500]}\\n\\n"
            f"[MARKET QUESTION: {safe_q}]\\n"
            'Respond with JSON: {"verdict": "YES or NO", "confidence": 0-100}'
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        if int(result["confidence"]) < 70:
            raise gl.vm.UserError("confidence too low — try again")
        self.resolution = result["verdict"]
        self.confidence = int(result["confidence"])
        self.status = RESOLVED
`,
  task: "Implement `get_status()` to return `self.status` and `get_resolution()` to return `self.resolution`.",
  hints: [
    "Both are `@gl.public.view` methods — they only read stored state, no computation needed.",
    "`get_resolution()` should return `self.resolution` — an empty string `\"\"` when the market is still OPEN.",
    "Replace each `pass` with a single `return` statement: `return self.status` and `return self.resolution`.",
  ],
};

export default content;
