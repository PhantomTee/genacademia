import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 29,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 29 — Special Methods

GenLayer contracts can define two special methods that handle raw messages and value transfers sent directly to the contract address — similar to Solidity's \`receive()\` and \`fallback()\` functions.

**\`__receive_value__(self, amount: u256) -> None\`** is called whenever GEN tokens are sent directly to the contract address (outside a payable method call). PredictX uses this to accept top-up contributions to the prize pool:

\`\`\`python
def __receive_value__(self, amount: u256) -> None:
    self.total_pot += amount
    gl.emit_debug(f"received {amount} wei directly, pot now {self.total_pot}")
\`\`\`

**\`__receive_message__(self, message: str) -> None\`** is called when another contract (or an off-chain caller) sends a string message to this contract address. PredictX handles two message types:

\`\`\`python
def __receive_message__(self, message: str) -> None:
    if message == "ping":
        pass  # no-op, used for liveness checks
    elif message == "cancel":
        if gl.message.sender_address == self.owner:
            if self.status == OPEN:
                self.status = CANCELLED
\`\`\`

These special methods enable composition: a DAO contract could send a \`"cancel"\` message to halt the market, or send GEN directly to top up the pot, all without knowing the specific method signatures of PredictX.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap, DynArray
from dataclasses import dataclass

OPEN      = "OPEN"
RESOLVED  = "RESOLVED"
CANCELLED = "CANCELLED"
MIN_BET   = 1_000_000_000_000_000  # 0.001 GEN in wei


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
    total_pot: u256
    oracle_contract: Address
    impl_address: Address
    version: int
    bets: TreeMap[Address, BetRecord]
    claimed: TreeMap[Address, bool]
    search_index: gl.VectorStorage
    winners: DynArray[Address]

    def __init__(self, question: str, market_id: u256, oracle: Address) -> None:
        self.question = question
        self.bet_count = 0
        self.owner = gl.message.sender_address
        self.market_id = market_id
        self.status = OPEN
        self.resolution = ""
        self.confidence = 0
        self.news_source = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        self.chart_url = "https://www.coingecko.com/en/coins/ethereum"
        self.total_pot = 0
        self.oracle_contract = oracle
        self.impl_address = Address("0x0000000000000000000000000000000000000000")
        self.version = 0
        self.bets = TreeMap[Address, BetRecord]()
        self.claimed = TreeMap[Address, bool]()
        self.search_index = gl.VectorStorage()
        self.winners = DynArray[Address]()

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
    def get_total_pot(self) -> int:
        return int(self.total_pot)

    @gl.public.view
    def get_oracle_price(self) -> int:
        return int(gl.call_contract(self.oracle_contract, "get_eth_price", []))

    @gl.public.view
    def get_version(self) -> int:
        return self.version

    @gl.public.write
    def upgrade(self, new_impl: Address) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        self.impl_address = new_impl
        self.version += 1

    @gl.public.write
    def transfer_ownership(self, new_owner: Address) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        if new_owner == Address("0x0000000000000000000000000000000000000000"):
            raise gl.vm.UserError("cannot transfer to zero address")
        self.owner = new_owner

    @gl.public.write.payable
    def place_bet(self, outcome: str) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        if outcome not in ["YES", "NO"]:
            raise gl.vm.UserError("outcome must be YES or NO")
        if gl.message.value < MIN_BET:
            raise gl.vm.UserError("min bet 0.001 GEN")
        self.bet_count += 1
        self.last_bettor = gl.message.sender_address
        self.bets[gl.message.sender_address] = BetRecord(
            outcome=outcome, amount=gl.message.value, bettor=gl.message.sender_address
        )
        self.total_pot += gl.message.value
        self.winners.append(gl.message.sender_address)
        self.search_index.add(
            f"{str(gl.message.sender_address)[:10]} bet {outcome}",
            {"outcome": outcome, "bettor": str(gl.message.sender_address)},
        )
        gl.emit_debug(
            f"place_bet: {gl.message.sender_address} bet {outcome} with {gl.message.value} wei"
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

    @gl.public.view
    def search_bets(self, query: str) -> list:
        results = self.search_index.search(query, top_k=5)
        return [r[1] for r in results]

    @gl.public.write
    def cancel(self) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        self.status = CANCELLED

    @gl.public.write
    def claim_winnings(self) -> None:
        if self.status != RESOLVED:
            raise gl.vm.UserError("market not resolved")
        caller = gl.message.sender_address
        record = self.bets.get(caller, None)
        if record is None or record.outcome != self.resolution:
            raise gl.vm.UserError("not a winner")
        if self.claimed.get(caller, False):
            raise gl.vm.UserError("already claimed")
        winning_total = sum(
            r.amount for r in self.bets.values() if r.outcome == self.resolution
        )
        share = record.amount * self.total_pot // winning_total
        self.claimed[caller] = True
        gl.emit_debug(f"claim_winnings: sending {share} wei to {caller}")
        gl.send(caller, share)

    def _tiebreak_side(self) -> str:
        return "YES" if gl.get_random_u8() < 128 else "NO"

    @gl.public.write
    def resolve_and_distribute(self) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("market not open")
        gl.emit_debug(f"resolve_and_distribute: starting, status={self.status}, pot={self.total_pot}")
        yes_total = sum(r.amount for r in self.bets.values() if r.outcome == "YES")
        no_total  = sum(r.amount for r in self.bets.values() if r.outcome == "NO")
        if yes_total == no_total:
            verdict = self._tiebreak_side()
        else:
            result = gl.vm.run_nondet_unsafe(
                lambda: self._leader_resolve(),
                lambda r: self._validate_resolution(r),
            )
            verdict = result["verdict"]
            self.confidence = int(result.get("confidence", 0))
        self.resolution = verdict
        self.status = RESOLVED
        winning_total = sum(r.amount for r in self.bets.values() if r.outcome == verdict)
        if winning_total == 0:
            return
        for addr in self.winners:
            record = self.bets.get(addr, None)
            if record and record.outcome == verdict and not self.claimed.get(addr, False):
                share = record.amount * self.total_pot // winning_total
                self.claimed[addr] = True
                gl.send(addr, share)

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

    def __receive_message__(self, message: str) -> None:
        pass  # TODO: handle "ping" (no-op) and "cancel" (cancel if sender is owner and market is OPEN)

    def __receive_value__(self, amount: u256) -> None:
        pass  # TODO: add amount to self.total_pot
`,
  task: "Implement `__receive_message__` to handle `\"ping\"` (no-op) and `\"cancel\"` (set `self.status = CANCELLED` only if the sender is the owner and the market is OPEN). Implement `__receive_value__` to add the incoming `amount` to `self.total_pot`.",
  hints: [
    "`__receive_message__` is triggered when another contract sends a raw string to this contract's address — no method call needed from the sender.",
    "For the `\"cancel\"` branch, check `gl.message.sender_address == self.owner` and `self.status == OPEN` before setting `self.status = CANCELLED`.",
    "`__receive_value__` is the simplest method in the contract: `self.total_pot += amount`.",
  ],
};

export default content;
