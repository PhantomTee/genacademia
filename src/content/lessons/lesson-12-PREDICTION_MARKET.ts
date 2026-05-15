import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 12 — Dataclasses as On-Chain Records

Storing just the outcome string works, but PredictX also needs to know how much each bettor wagered and who they are. Python \`@dataclass\` types can be stored in a \`TreeMap\`, giving us a structured record per bettor.

\`\`\`python
from dataclasses import dataclass
from genlayer.types import Address, u256

@dataclass
class BetRecord:
    outcome: str
    amount: u256
    bettor: Address
\`\`\`

The \`@dataclass\` decorator auto-generates \`__init__\`, \`__repr__\`, and \`__eq__\` — and GenLayer knows how to serialise these to on-chain storage. Update the \`TreeMap\` type parameter to \`TreeMap[Address, BetRecord]\`:

\`\`\`python
self.bets: TreeMap[Address, BetRecord]

@gl.public.write
def place_bet(self, outcome: str) -> None:
    record = BetRecord(
        outcome=outcome,
        amount=0,        # will be set from gl.message.value in Lesson 21
        bettor=gl.message.sender_address,
    )
    self.bets[gl.message.sender_address] = record
\`\`\`

Using structured records now means the payout logic in Lessons 22–25 can read \`record.amount\` and \`record.bettor\` directly without a separate lookup. Good data modelling now saves complexity later.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


@dataclass
class BetRecord:
    pass  # TODO: add fields: outcome: str, amount: u256, bettor: Address


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
    bets: TreeMap[Address, BetRecord]

    def __init__(self, question: str, market_id: u256) -> None:
        self.question = question
        self.bet_count = 0
        self.owner = gl.message.sender_address
        self.market_id = market_id
        self.is_open = True
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
    def place_bet(self, outcome: str) -> None:
        if outcome not in ["YES", "NO"]:
            raise gl.vm.UserError("outcome must be YES or NO")
        self.bet_count += 1
        self.last_bettor = gl.message.sender_address
        # TODO: create a BetRecord and store it in self.bets

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
  task: "Complete the `BetRecord` dataclass with fields `outcome: str`, `amount: u256`, and `bettor: Address`, then update `place_bet()` to create and store a `BetRecord` in `self.bets`.",
  hints: [
    "Add the `@dataclass` decorator and three type-annotated fields: `outcome: str`, `amount: u256`, `bettor: Address`.",
    "Create the record inside `place_bet`: `record = BetRecord(outcome=outcome, amount=0, bettor=gl.message.sender_address)`",
    "`self.bets[gl.message.sender_address] = BetRecord(outcome=outcome, amount=0, bettor=gl.message.sender_address)`",
  ],
};

export default content;
