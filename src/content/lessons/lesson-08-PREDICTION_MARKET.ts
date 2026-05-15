import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 8,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 8 — \`u256\`: Numeric Storage

\`u256\` is an unsigned 256-bit integer — the correct type for all on-chain numeric values in GenLayer, including amounts, prices, and counters. Never use Python's built-in \`int\` in GenLayer contracts; it does not map to a fixed on-chain type and can cause unexpected behaviour.

### Constructing u256 values

Wrap a Python integer literal with \`u256()\` to create an on-chain numeric value:

\`\`\`python
min_stake: u256 = u256(100)
zero: u256 = u256(0)
\`\`\`

### Comparisons and arithmetic

Standard Python operators work normally with \`u256\`:

\`\`\`python
assert min_stake > u256(0), "Stake must be positive"
total += amount   # u256 += u256
\`\`\`

### Adding a minimum stake per market

Each market can enforce its own minimum bet size. Store it in a \`TreeMap[str, u256]\` keyed by market ID, then validate it is greater than zero before creating the market:

\`\`\`python
assert min_stake > u256(0), "Minimum stake must be greater than zero"
self.market_min_stakes[market_id] = min_stake
\`\`\`

This pattern — declare a \`TreeMap[str, u256]\`, accept the value as a parameter, validate it, store it — will repeat for every numeric field you add to a market record.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str
    market_questions: TreeMap[str, str]
    market_outcome_a: TreeMap[str, str]
    market_outcome_b: TreeMap[str, str]
    market_creators: TreeMap[str, Address]
    market_statuses: TreeMap[str, str]
    market_count: u256

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.platform_name + ": " + self.platform_description

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update description"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description

    @gl.public.write
    def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:
        market_id = "0"
        self.market_creators[market_id] = gl.message.sender_address
        self.market_questions[market_id] = question
        self.market_outcome_a[market_id] = outcome_a
        self.market_outcome_b[market_id] = outcome_b
        self.market_statuses[market_id] = "active"
        return market_id
`,
  task: "Add `market_min_stakes: TreeMap[str, u256]` as a class-level field, update `create_market` to accept a `min_stake: u256` parameter, validate `min_stake > u256(0)` with an assert, and store it in `self.market_min_stakes[market_id]`.",
  hints: [
    "Add `market_min_stakes: TreeMap[str, u256]` to the class-level field declarations.",
    "Add `min_stake: u256` as the last parameter of `create_market`.",
    "The validation assert is: `assert min_stake > u256(0), \"Minimum stake must be greater than zero\"`",
  ],
};

export default content;
