import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 14,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 14 — State Machines

PredictX markets move through a lifecycle: they start **OPEN**, then become either **RESOLVED** (AI picked a winner) or **CANCELLED** (owner called it off). A string constant is fine for storage, but you need to *enforce* the transitions — otherwise someone could call \`resolve()\` on an already-resolved market and overwrite the result.

Define the valid states as module-level constants so every check reads clearly:

\`\`\`python
OPEN       = "OPEN"
RESOLVED   = "RESOLVED"
CANCELLED  = "CANCELLED"
\`\`\`

Then guard every write method with a status check:

\`\`\`python
@gl.public.write
def place_bet(self, outcome: str) -> None:
    if self.status != OPEN:
        raise gl.vm.UserError("market not open")
    ...

@gl.public.write
def resolve(self) -> None:
    if self.status != OPEN:
        raise gl.vm.UserError("market not open")
    ...
    self.status = RESOLVED

@gl.public.write
def cancel(self) -> None:
    if gl.message.sender_address != self.owner:
        raise gl.vm.UserError("unauthorized")
    if self.status != OPEN:
        raise gl.vm.UserError("market not open")
    self.status = CANCELLED
\`\`\`

State machine enforcement is the contract equivalent of a database constraint — it makes invalid states unrepresentable at runtime. The three constants also act as documentation: any reader can see the full lifecycle at a glance.`,
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

    @gl.public.write
    def transfer_ownership(self, new_owner: Address) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        if new_owner == Address("0x0000000000000000000000000000000000000000"):
            raise gl.vm.UserError("cannot transfer to zero address")
        self.owner = new_owner

    @gl.public.write
    def place_bet(self, outcome: str) -> None:
        # TODO: add status check — only allow when OPEN
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
        # TODO: add status check and set self.status = CANCELLED
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")

    def _safe_text(self, text: str) -> str:
        return text.replace("\\n", " ").replace("[", "").replace("]", "")

    @gl.public.write
    def resolve(self) -> None:
        # TODO: add status check; set self.status = RESOLVED after resolution
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
  task: "Add status-transition guards: `place_bet()` must raise if status is not OPEN; `resolve()` must raise if not OPEN, then set `self.status = RESOLVED`; `cancel()` must raise if not OPEN (in addition to the owner check), then set `self.status = CANCELLED`.",
  hints: [
    "Use the module-level constants: `if self.status != OPEN: raise gl.vm.UserError(\"market not open\")`",
    "In `resolve()`, add the guard at the very top, then after storing `self.resolution` add `self.status = RESOLVED`.",
    "In `cancel()`, check owner first, then `if self.status != OPEN: raise gl.vm.UserError(\"market not open\")`, then `self.status = CANCELLED`.",
  ],
};

export default content;
