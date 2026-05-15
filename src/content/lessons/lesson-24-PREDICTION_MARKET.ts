import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 24,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 24 — Contract-to-Contract Calls

PredictX could resolve based on a single JSON endpoint, but a price oracle contract is more reliable: it aggregates multiple data sources and exposes a clean \`get_eth_price()\` method. \`gl.call_contract\` lets you call any other deployed contract from within yours:

\`\`\`python
gl.call_contract(address, method_name, args_list)
\`\`\`

The return value is whatever the called contract's method returns. For PredictX, calling an oracle that returns the current ETH price in USD cents:

\`\`\`python
oracle_contract: Address

@gl.public.view
def get_oracle_price(self) -> int:
    return int(gl.call_contract(self.oracle_contract, "get_eth_price", []))
\`\`\`

A few things to keep in mind:

1. **The called contract must be deployed.** \`call_contract\` will revert if the address is invalid or the method doesn't exist.
2. **Args are a plain Python list.** Pass \`[]\` for no arguments, or \`[arg1, arg2]\` for multiple.
3. **Cross-contract calls are synchronous.** GenLayer executes them inline — there's no async/await.

You stored \`oracle_contract: Address\` during \`__init__\` as the second constructor argument. This pattern (pass dependency addresses in via constructor) is standard smart contract design — it makes contracts testable and upgradable.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
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
    bets: TreeMap[Address, BetRecord]
    claimed: TreeMap[Address, bool]
    search_index: gl.VectorStorage

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
        self.bets = TreeMap[Address, BetRecord]()
        self.claimed = TreeMap[Address, bool]()
        self.search_index = gl.VectorStorage()

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
        pass  # TODO: call self.oracle_contract "get_eth_price" with no args and return as int

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
        self.search_index.add(
            f"{str(gl.message.sender_address)[:10]} bet {outcome}",
            {"outcome": outcome, "bettor": str(gl.message.sender_address)},
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
        gl.send(caller, share)

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
`,
  task: "Implement `get_oracle_price()` to call the external oracle contract stored in `self.oracle_contract` using `gl.call_contract`, invoking its `\"get_eth_price\"` method with no arguments, and returning the result as an `int`.",
  hints: [
    "`gl.call_contract(address, method_name, args_list)` — the third argument is always a Python list, even when empty.",
    "Pass `[]` as the args list since `get_eth_price` takes no parameters.",
    "`return int(gl.call_contract(self.oracle_contract, \"get_eth_price\", []))`",
  ],
};

export default content;
