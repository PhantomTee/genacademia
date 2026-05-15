import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 4 — GenLayer Types Deep Dive

GenLayer provides specialised Python types that map precisely to on-chain data: \`Address\` for wallet addresses and \`u256\` for large unsigned integers (used for token amounts and IDs).

Using the right types matters — \`Address\` is not just a string. It enforces hex-address format, supports equality comparison, and will be required for \`gl.send\` calls in later lessons. Similarly, \`u256\` prevents negative balances and overflow issues that plague contracts using plain Python \`int\`.

\`\`\`python
from genlayer.types import Address, u256

class PredictionMarket(gl.Contract):
    owner: Address
    market_id: u256

    def __init__(self, question: str, market_id: u256) -> None:
        self.owner = gl.message.sender_address  # Address of deployer
        self.market_id = market_id
\`\`\`

Notice that \`gl.message.sender_address\` is already an \`Address\` type — no casting needed. Whoever deploys the contract becomes the owner, a pattern you'll use for owner-gated operations like cancellation and resolution.

Adding a \`get_owner()\` view lets the frontend display the market creator and verify ownership off-chain.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256


class PredictionMarket(gl.Contract):
    question: str
    bet_count: int
    last_bettor: Address
    owner: Address
    market_id: u256

    def __init__(self, question: str, market_id: u256) -> None:
        self.question = question
        self.bet_count = 0
        # TODO: set self.owner to the deployer's address
        # TODO: set self.market_id to the market_id argument

    @gl.public.view
    def get_question(self) -> str:
        return self.question

    @gl.public.view
    def get_owner(self) -> str:
        pass

    @gl.public.write
    def place_bet(self, outcome: str) -> None:
        if outcome not in ["YES", "NO"]:
            raise gl.vm.UserError("outcome must be YES or NO")
        self.bet_count += 1
        self.last_bettor = gl.message.sender_address

    @gl.public.view
    def get_bet_count(self) -> int:
        return self.bet_count
`,
  task: "Set `self.owner` and `self.market_id` in `__init__`, then implement `get_owner()` to return the owner address as a string.",
  hints: [
    "`gl.message.sender_address` is already an `Address` — assign it directly to `self.owner` inside `__init__`.",
    "`self.market_id = market_id` stores the constructor argument; `Address` and `u256` are drop-in type annotations.",
    "`get_owner` returns a string: `return str(self.owner)` converts the `Address` to a readable hex string.",
  ],
};

export default content;
