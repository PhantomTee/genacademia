import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 9 — gl.nondet.web.get

An LLM answering purely from training data is unreliable for recent price events. PredictX can do better: \`gl.nondet.web.get(url)\` fetches a live web page and returns its body as a string, giving the AI fresh context to work with.

\`\`\`python
data = gl.nondet.web.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
prompt = (
    f"Current market data: {data[:1500]}\\n\\n"
    f"[MARKET QUESTION: {self._safe_text(self.question)}]\\n"
    "Has this condition been met? "
    'Respond with JSON: {"verdict": "YES or NO", "confidence": 0-100}'
)
\`\`\`

Key practices:
- **Truncate the response** with \`[:1500]\` — LLM context windows are finite and large pages waste tokens.
- **Put data before the question** — most LLMs pay more attention to early context.
- Store the URL in contract state (\`self.news_source\`) so the owner can update it without redeploying.

Like \`exec_prompt\`, \`web.get\` is non-deterministic but consensus-safe — validators fetch the same URL and GenLayer ensures they reach agreement on the content.`,
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
        # TODO: fetch self.news_source with gl.nondet.web.get
        # Include first 1500 chars as context in the prompt
        safe_q = self._safe_text(self.question)
        prompt = (
            f"[MARKET QUESTION: {safe_q}] "
            "Has this condition been met? "
            'Respond with JSON: {"verdict": "YES or NO", "confidence": 0-100}'
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        self.resolution = result["verdict"]
        self.confidence = int(result["confidence"])
`,
  task: "Update `resolve()` to fetch `self.news_source` using `gl.nondet.web.get` and include the first 1500 characters of the response as context in the LLM prompt.",
  hints: [
    "`gl.nondet.web.get(url)` returns the page body as a plain string — store it in a local variable.",
    "Truncate with `data[:1500]` to keep the prompt short and avoid hitting token limits.",
    "`data = gl.nondet.web.get(self.news_source); prompt = f\"Context: {data[:1500]}\\\\n\\\\n[MARKET QUESTION: {safe_q}] Has this condition been met? ...`",
  ],
};

export default content;
