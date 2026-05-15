import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 11,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 11 — TreeMap & DynArray

A single \`bet_count\` integer tells us how many people bet, but not *who* or *what* they bet. PredictX needs to map each bettor's address to their chosen outcome so we can pay winners later.

\`TreeMap[K, V]\` is GenLayer's on-chain key-value store. Unlike a Python \`dict\`, it persists across calls and supports the full range of on-chain key types including \`Address\`.

\`\`\`python
from genlayer.types import Address, TreeMap

class PredictionMarket(gl.Contract):
    bets: TreeMap[Address, str]

    def __init__(self, ...) -> None:
        self.bets = TreeMap[Address, str]()

    @gl.public.write
    def place_bet(self, outcome: str) -> None:
        self.bets[gl.message.sender_address] = outcome

    @gl.public.view
    def get_bet(self, bettor: Address) -> str:
        return self.bets.get(bettor, "NO_BET")
\`\`\`

Use \`.get(key, default)\` for safe reads — if the bettor hasn't placed a bet, you get back \`"NO_BET"\` instead of a \`KeyError\`. Direct bracket access (\`self.bets[key]\`) raises if the key is missing.

\`DynArray[T]\` works like a resizable list: \`append()\`, index access, and \`len()\`. You'll use it to track bettor addresses for iteration during payout.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap


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
    bets: TreeMap[Address, str]

    def __init__(self, question: str, market_id: u256) -> None:
        self.question = question
        self.bet_count = 0
        self.owner = gl.message.sender_address
        self.market_id = market_id
        self.is_open = True
        self.resolution = ""
        self.confidence = 0
        self.news_source = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        # TODO: initialise self.bets as TreeMap[Address, str]()

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
        # TODO: store outcome in self.bets keyed by caller's address

    @gl.public.view
    def get_bet_count(self) -> int:
        return self.bet_count

    @gl.public.view
    def get_bet(self, bettor: Address) -> str:
        pass

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
`,
  task: "Initialise `self.bets` as a `TreeMap[Address, str]()` in `__init__`, update `place_bet()` to store the caller's outcome in the map, and implement `get_bet()` to safely return a bettor's chosen outcome.",
  hints: [
    "Declare `TreeMap[Address, str]` as a class annotation and initialise it in `__init__`: `self.bets = TreeMap[Address, str]()`.",
    "In `place_bet`, after validation: `self.bets[gl.message.sender_address] = outcome`.",
    "Use `.get()` for safe reads: `return self.bets.get(bettor, \"NO_BET\")` returns a default if the address has no bet.",
  ],
};

export default content;
