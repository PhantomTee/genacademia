import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 21,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 21 — Payable Methods & gl.message.value

So far PredictX bets record an \`outcome\` but no real stake — \`BetRecord.amount\` is always 0. To make the market real, bets need to carry GEN token value.

Mark a method \`@gl.public.write.payable\` to allow callers to attach GEN when they call it. The amount sent (in wei, where 1 GEN = 10^18 wei) is available as \`gl.message.value\`:

\`\`\`python
MIN_BET = 1_000_000_000_000_000  # 0.001 GEN in wei

@gl.public.write.payable
def place_bet(self, outcome: str) -> None:
    if self.status != OPEN:
        raise gl.vm.UserError("market not open")
    if outcome not in ["YES", "NO"]:
        raise gl.vm.UserError("outcome must be YES or NO")
    if gl.message.value < MIN_BET:
        raise gl.vm.UserError("min bet 0.001 GEN")
    self.bets[gl.message.sender_address] = BetRecord(
        outcome=outcome,
        amount=gl.message.value,
        bettor=gl.message.sender_address,
    )
    self.total_pot += gl.message.value
    self.bet_count += 1
\`\`\`

Two key rules:
1. A \`@gl.public.write\` method (without \`.payable\`) will **reject** any transaction that sends GEN — use \`.payable\` only where you explicitly intend to receive value.
2. Any GEN sent to a payable method is immediately held by the contract. The contract must later distribute it via \`gl.send\` (Lesson 22) or it stays locked forever.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass

OPEN      = "OPEN"
RESOLVED  = "RESOLVED"
CANCELLED = "CANCELLED"
MIN_BET   = 1_000_000_000_000_000  # 0.001 GEN in wei


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
    chart_url: str
    total_pot: u256
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
        self.chart_url = "https://www.coingecko.com/en/coins/ethereum"
        self.total_pot = 0
        self.bets = TreeMap[Address, BetRecord]()

    @gl.public.view
    def get_question(self) -> str:
        return self.question

    @gl.public.view
    def get_owner(self) -> str:
        return str(self.owner)

    @gl.public.view
    def get_status(self) -> str:
        return self.status

    @gl.public.view
    def get_resolution(self) -> str:
        return self.resolution

    @gl.public.view
    def get_total_pot(self) -> int:
        return int(self.total_pot)

    @gl.public.write
    def transfer_ownership(self, new_owner: Address) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        if new_owner == Address("0x0000000000000000000000000000000000000000"):
            raise gl.vm.UserError("cannot transfer to zero address")
        self.owner = new_owner

    # TODO: change decorator to @gl.public.write.payable
    # TODO: require gl.message.value >= MIN_BET
    # TODO: store gl.message.value in BetRecord.amount and add to self.total_pot
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

    def _leader_resolve(self) -> dict:
        data = gl.nondet.web.get(self.news_source)
        img  = gl.nondet.web.render(self.chart_url)
        prompt = (
            f"Price API data: {data[:800]}\\n"
            f"Question: {self.question}\\n"
            'Use both the text data AND the chart image. '
            'JSON: {"verdict": "YES or NO", "confidence": 0-100}'
        )
        return gl.nondet.exec_prompt(prompt, response_format="json", images=[img])

    def _validate_resolution(self, r) -> bool:
        return (
            isinstance(r, dict)
            and r.get("verdict") in ["YES", "NO"]
            and 0 <= int(r.get("confidence", -1)) <= 100
        )

    @gl.public.write
    def resolve(self) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        result = gl.vm.run_nondet_unsafe(
            lambda: self._leader_resolve(),
            lambda r: self._validate_resolution(r),
        )
        self.resolution = result["verdict"]
        self.confidence = int(result.get("confidence", 0))
        self.status = RESOLVED
`,
  task: "Change `place_bet()`'s decorator to `@gl.public.write.payable`, add a minimum-bet check (`gl.message.value >= MIN_BET`), store `gl.message.value` in the `BetRecord.amount` field, and add it to `self.total_pot`.",
  hints: [
    "Replace `@gl.public.write` with `@gl.public.write.payable` — this is the only way to receive GEN in a method.",
    "Add the guard: `if gl.message.value < MIN_BET: raise gl.vm.UserError(\"min bet 0.001 GEN\")`",
    "Pass `amount=gl.message.value` when constructing `BetRecord`, then `self.total_pot += gl.message.value`.",
  ],
};

export default content;
