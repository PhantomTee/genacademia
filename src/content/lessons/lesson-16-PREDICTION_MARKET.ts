import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 16 — run_nondet_unsafe

GenLayer's consensus model runs every non-deterministic call on multiple validator nodes. By default, each validator re-runs your LLM prompt and checks that the answer is *equivalent* — but sometimes you want to define what "equivalent" means yourself.

\`gl.vm.run_nondet_unsafe(leader_fn, validator_fn)\` lets you do exactly that. The leader node runs \`leader_fn()\` and broadcasts the result. Each validator node calls \`validator_fn(result)\` — if it returns \`True\` the validator accepts the leader's answer; if any validator returns \`False\` the transaction reverts.

\`\`\`python
def _leader_resolve(self) -> dict:
    data = gl.nondet.web.get(self.news_source)
    prompt = (
        f"Context: {data[:1500]}\\n"
        f"Question: {self.question}\\n"
        'JSON: {"verdict": "YES or NO", "confidence": 0-100}'
    )
    return gl.nondet.exec_prompt(prompt, response_format="json")

def _validate_resolution(self, r: dict) -> bool:
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
    self.status = RESOLVED
\`\`\`

The leader and validator functions are *not* decorated — they are private helpers. Only \`resolve()\` is the public entry point.`,
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

    @gl.public.view
    def get_status(self) -> str:
        return self.status

    @gl.public.view
    def get_resolution(self) -> str:
        return self.resolution

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

    def _safe_text(self, text: str) -> str:
        return text.replace("\\n", " ").replace("[", "").replace("]", "")

    def _leader_resolve(self) -> dict:
        pass  # TODO: fetch self.news_source with web.get, build prompt, call exec_prompt with response_format="json", return the dict

    def _validate_resolution(self, r) -> bool:
        pass  # TODO: check r is a dict with "verdict" in ["YES","NO"] and "confidence" 0-100

    @gl.public.write
    def resolve(self) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        # TODO: replace the exec_prompt call below with gl.vm.run_nondet_unsafe
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
        self.status = RESOLVED
`,
  task: "Implement `_leader_resolve()` to fetch `self.news_source`, build the resolution prompt, and return the JSON result from `exec_prompt`. Implement `_validate_resolution(r)` to check the structure. Then update `resolve()` to call `gl.vm.run_nondet_unsafe` instead of calling `exec_prompt` directly.",
  hints: [
    "`gl.vm.run_nondet_unsafe(leader_fn, validator_fn)` — the leader runs first and its return value is passed to each validator as the argument `r`.",
    "In `_leader_resolve`, call `gl.nondet.exec_prompt(prompt, response_format=\"json\")` and return the dict; in `_validate_resolution`, return a `bool`.",
    "`result = gl.vm.run_nondet_unsafe(lambda: self._leader_resolve(), lambda r: self._validate_resolution(r))` then store `result[\"verdict\"]` in `self.resolution`.",
  ],
};

export default content;
