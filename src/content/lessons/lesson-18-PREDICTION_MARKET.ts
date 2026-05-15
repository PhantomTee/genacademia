import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 18,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 18 — Visual Input with web.render

So far PredictX resolves markets by fetching JSON price data with \`gl.nondet.web.get\`. But some information is only available visually — chart images, dashboard screenshots, or rendered pages that don't expose a clean API.

\`gl.nondet.web.render(url)\` loads the full page in a headless browser and returns a screenshot as **bytes**. Like \`web.get\`, it is non-deterministic (every validator renders independently), so it is only valid inside a \`run_nondet_unsafe\` leader function or a simple \`@gl.public.write\` when you call it directly.

\`\`\`python
chart_url: str  # stored in contract state

@gl.public.view
def get_chart_image(self) -> bytes:
    return gl.nondet.web.render(self.chart_url)
\`\`\`

The returned bytes can be:
- **Stored in state** (large, not recommended for on-chain storage)
- **Passed to \`exec_prompt\`** with the \`images=[]\` kwarg (Lesson 19)
- **Returned directly** from a view method for off-chain consumption

PredictX uses a CoinGecko chart URL so the leader can visually confirm the ETH price chart rather than relying solely on the JSON API endpoint. This adds a second, independent data source for higher-confidence resolution.`,
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
    chart_url: str
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
    def get_chart_image(self) -> bytes:
        pass  # TODO: return gl.nondet.web.render(self.chart_url)

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

    def _leader_resolve(self) -> dict:
        data = gl.nondet.web.get(self.news_source)
        prompt = (
            f"Context: {data[:1500]}\\n"
            f"Question: {self.question}\\n"
            'JSON: {"verdict": "YES or NO", "confidence": 0-100}'
        )
        return gl.nondet.exec_prompt(prompt, response_format="json")

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
  task: "Implement `get_chart_image()` to return a screenshot of `self.chart_url` using `gl.nondet.web.render`.",
  hints: [
    "`gl.nondet.web.render(url)` works like `web.get` but renders the full page and returns bytes instead of a string.",
    "The method is marked `@gl.public.view` — no state changes, just fetch and return the screenshot bytes.",
    "`return gl.nondet.web.render(self.chart_url)` is the entire implementation.",
  ],
};

export default content;
