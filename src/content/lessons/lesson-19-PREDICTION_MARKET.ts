import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 19,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 19 — Multi-Modal AI

PredictX can now render price charts as images. The next step is asking an AI to *read* them. \`gl.nondet.exec_prompt\` accepts an \`images\` keyword argument — a list of byte strings — enabling vision-capable models to analyze charts, screenshots, or any visual data alongside a text prompt.

\`\`\`python
@gl.public.write
def analyze_chart(self) -> str:
    img = gl.nondet.web.render(self.chart_url)
    answer = gl.nondet.exec_prompt(
        "Does this ETH/USD price chart show the price above $10,000 at any point? "
        "Answer YES or NO only.",
        images=[img],
    )
    return answer.strip().upper()
\`\`\`

A few things to note:

1. **Capture first, then analyze.** Call \`web.render\` to get the bytes, then pass them to \`exec_prompt\`. Don't try to embed the URL directly.

2. **Be specific in the prompt.** Vague prompts like "describe this chart" produce long prose. Asking for YES/NO keeps the output parseable.

3. **\`images\` is a list.** You can pass multiple images if you want the model to compare e.g. a current screenshot vs a historical one.

In Lesson 20 you'll combine this with \`run_nondet_unsafe\` so the visual analysis also goes through the full consensus pipeline.`,
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
        pass  # TODO: render chart_url, pass bytes to exec_prompt asking if ETH is above $10,000

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
  task: "Implement `analyze_chart()` to capture a screenshot of `self.chart_url` with `web.render`, then pass the bytes to `exec_prompt` asking whether the chart shows ETH above $10,000, returning `\"YES\"` or `\"NO\"`.",
  hints: [
    "Call `gl.nondet.web.render(self.chart_url)` first to get the image bytes, then pass them as `images=[img]` to `exec_prompt`.",
    "Keep the prompt focused: ask specifically whether the ETH/USD price exceeds $10,000 and request a YES/NO answer.",
    "`img = gl.nondet.web.render(self.chart_url); return gl.nondet.exec_prompt(\"Does this price chart show ETH above $10,000? Answer YES or NO.\", images=[img]).strip().upper()`",
  ],
};

export default content;
