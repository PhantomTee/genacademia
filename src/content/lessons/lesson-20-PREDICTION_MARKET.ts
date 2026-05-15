import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 20 — CAPSTONE: Advanced AI

You now have all the pieces for a fully multi-modal, consensus-safe resolution:

- **run_nondet_unsafe** (L16) — custom leader/validator split
- **Non-comparative equivalence** (L17) — validators check structure, not re-run the LLM
- **web.render** (L18) — visual screenshot of the ETH price chart
- **images= kwarg** (L19) — feed screenshots to the LLM

This capstone combines them all into a production-quality \`resolve()\`:

\`\`\`python
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
\`\`\`

The validator still uses non-comparative checks (verdict + confidence range) — it never touches the LLM. After this lesson, PredictX's AI resolution layer is complete.`,
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
        return gl.nondet.web.render(self.chart_url)

    @gl.public.write
    def analyze_chart(self) -> str:
        img = gl.nondet.web.render(self.chart_url)
        return gl.nondet.exec_prompt(
            "Does this ETH/USD price chart show the price above $10,000 at any point? "
            "Answer YES or NO only.",
            images=[img],
        ).strip().upper()

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
        # TODO: upgrade this to also render the chart and pass images to exec_prompt
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
        # TODO: this still calls exec_prompt directly — upgrade to run_nondet_unsafe
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        data = gl.nondet.web.get(self.news_source)
        prompt = (
            f"Context: {data[:1500]}\\n"
            f"Question: {self.question}\\n"
            'JSON: {"verdict": "YES or NO", "confidence": 0-100}'
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        self.resolution = result["verdict"]
        self.confidence = int(result.get("confidence", 0))
        self.status = RESOLVED
`,
  task: "Upgrade `_leader_resolve()` to also fetch the chart screenshot with `web.render` and pass `images=[img]` to `exec_prompt`. Then rewrite `resolve()` to use `gl.vm.run_nondet_unsafe` with the updated leader and the existing non-comparative validator.",
  hints: [
    "In `_leader_resolve`, add `img = gl.nondet.web.render(self.chart_url)` and pass `images=[img]` as a kwarg to `exec_prompt`.",
    "The validator `_validate_resolution` does not change — it still only checks structure, not the image.",
    "`result = gl.vm.run_nondet_unsafe(lambda: self._leader_resolve(), lambda r: self._validate_resolution(r))` then store `result[\"verdict\"]` and set `self.status = RESOLVED`.",
  ],
};

export default content;
