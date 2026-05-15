import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 13 — Address Type & Ownership

PredictX markets may need to transfer control — for example when a market creator wants to hand off a market to a DAO or multi-sig. The \`transfer_ownership\` function does this with two safety guards.

**Guard 1 — Only the current owner can transfer:**
\`\`\`python
if gl.message.sender_address != self.owner:
    raise gl.vm.UserError("unauthorized")
\`\`\`

**Guard 2 — Reject the zero address:**
The zero address (\`0x0000...0000\`) is a common burn/null address. Transferring ownership there would lock the contract forever.
\`\`\`python
if new_owner == Address("0x0000000000000000000000000000000000000000"):
    raise gl.vm.UserError("cannot transfer to zero address")
\`\`\`

\`Address\` values support \`==\` and \`!=\` comparison directly. Never compare addresses as strings — string comparison is case-sensitive and won't catch checksum variants.

After both guards pass, the transfer is a single assignment:
\`\`\`python
self.owner = new_owner
\`\`\`

This pattern — check caller, check argument validity, then mutate — is the standard form for any privileged write operation in a smart contract.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


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
    def transfer_ownership(self, new_owner: Address) -> None:
        pass

    @gl.public.write
    def place_bet(self, outcome: str) -> None:
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
  task: "Implement `transfer_ownership()` so only the current owner can set `self.owner` to a new `Address`, rejecting zero-address transfers with a `UserError`.",
  hints: [
    "Check caller first: `if gl.message.sender_address != self.owner: raise gl.vm.UserError(\"unauthorized\")`",
    "Then check the target address: compare `new_owner == Address(\"0x0000000000000000000000000000000000000000\")`",
    "After both guards pass, simply assign: `self.owner = new_owner`",
  ],
};

export default content;
