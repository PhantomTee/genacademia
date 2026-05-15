import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 17,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 17 — Non-Comparative Equivalence

When validators check a leader's result, the naive approach is to re-run the same LLM call and demand identical output. That fails in practice: LLMs are non-deterministic, prices change by the millisecond, and different validators may hit different web snapshots.

**Non-comparative equivalence** solves this: instead of reproducing the leader's answer, each validator checks whether the answer is *plausible* — structurally correct and within expected bounds — without running the LLM again.

For PredictX's resolution result \`{"verdict": "YES", "confidence": 87}\`, a good non-comparative check is:

\`\`\`python
def _validate_resolution(self, r) -> bool:
    if not isinstance(r, dict):
        return False
    verdict = r.get("verdict")
    confidence = r.get("confidence", -1)
    return (
        verdict in ["YES", "NO"]
        and isinstance(confidence, (int, float))
        and 0 <= int(confidence) <= 100
    )
\`\`\`

This validator catches all invalid responses (wrong type, missing keys, out-of-range confidence, garbage verdict) while accepting any legitimate YES/NO answer regardless of which model replica answered.

The key insight: validators are checking the **contract** of the return value, not replicating the computation. This keeps consensus fast and deterministic while still protecting against a malicious or buggy leader node producing a corrupted result.`,
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

    def _leader_resolve(self) -> dict:
        data = gl.nondet.web.get(self.news_source)
        prompt = (
            f"Context: {data[:1500]}\\n"
            f"Question: {self.question}\\n"
            'JSON: {"verdict": "YES or NO", "confidence": 0-100}'
        )
        return gl.nondet.exec_prompt(prompt, response_format="json")

    def _validate_resolution(self, r) -> bool:
        # TODO: rewrite this — currently uses exact equality (wrong approach).
        # Validators should check the result is structurally valid,
        # NOT re-run the LLM and compare outputs.
        try:
            other = self._leader_resolve()
            return r == other
        except Exception:
            return False

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
  task: "Rewrite `_validate_resolution(self, r) -> bool` to use non-comparative equivalence: verify that `r` is a dict with `\"verdict\"` equal to `\"YES\"` or `\"NO\"` and `\"confidence\"` in the range 0–100, without calling the LLM or `web.get` again.",
  hints: [
    "Non-comparative means validators only inspect the structure of `r` — no re-running `_leader_resolve()` or any LLM call inside the validator.",
    "Check: `isinstance(r, dict)` first, then `r.get(\"verdict\") in [\"YES\", \"NO\"]`, then validate the confidence range.",
    "`return isinstance(r, dict) and r.get(\"verdict\") in [\"YES\", \"NO\"] and 0 <= int(r.get(\"confidence\", -1)) <= 100`",
  ],
};

export default content;
