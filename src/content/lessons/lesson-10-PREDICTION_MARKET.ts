import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 10,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 10 — CAPSTONE: AI Oracle

This capstone combines everything from Lessons 6–9 into a production-grade resolution oracle. The complete \`resolve()\` method:

1. Fetches live price data from \`self.news_source\` via \`web.get\`
2. Sanitises the market question with \`_safe_text\`
3. Calls \`exec_prompt\` with \`response_format="json"\` for structured output
4. **Rejects low-confidence resolutions** — if the AI is less than 70% sure, it raises a \`UserError\` so the owner can try again later

\`\`\`python
@gl.public.write
def resolve(self) -> None:
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
\`\`\`

The confidence gate is crucial for a fair market: it prevents the contract from settling on ambiguous data and gives the owner the option to retry when evidence is inconclusive.`,
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
    confidence: int
    news_source: str

    def __init__(self, question: str, market_id: u256) -> None:
        self.question = question
        self.bet_count = 0
        self.owner = gl.message.sender_address
        self.market_id = market_id
        self.is_open = True
        self.resolution = ""
        self.confidence = 0
        self.news_source = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"

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

    def _safe_text(self, text: str) -> str:
        return text.replace("\\n", " ").replace("[", "").replace("]", "")

    @gl.public.write
    def resolve(self) -> None:
        # TODO: fetch news_source, call exec_prompt with JSON format,
        # raise UserError if confidence < 70, otherwise store verdict and confidence
        pass
`,
  task: "Implement the complete `resolve()`: fetch `self.news_source`, call `exec_prompt` with JSON format asking for verdict and confidence, raise `UserError` if confidence is below 70, otherwise store both values.",
  hints: [
    "Chain the calls: `data = gl.nondet.web.get(self.news_source)` then build a prompt including `data[:1500]` and the sanitised question.",
    "Parse the JSON dict: `result = gl.nondet.exec_prompt(prompt, response_format=\"json\")` then check `int(result[\"confidence\"]) < 70`.",
    "`if int(result[\"confidence\"]) < 70: raise gl.vm.UserError(\"confidence too low — try again\")` — only store after this gate.",
  ],
};

export default content;
