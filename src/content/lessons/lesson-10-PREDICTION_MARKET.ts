import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 10,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 10 — CAPSTONE: Persistent Counter for Unique Market IDs

Hard-coding the market ID as \`"0"\` means every \`create_market\` call overwrites the same record. To support multiple independent markets, you need a persistent counter that increments each time a market is created.

### The counter pattern

\`market_count: u256\` starts at zero and is initialised in \`__init__\`. Every time a market is created, the current counter value becomes the market ID, data is stored, then the counter is incremented:

\`\`\`python
market_id = str(self.market_count)
# ... store all market data using market_id ...
self.market_count += u256(1)
return market_id
\`\`\`

The increment happens **after** writing all market data. This ensures the ID embedded in the stored data matches what gets returned to the caller. The first market gets ID \`"0"\`, the second gets \`"1"\`, and so on.

### Converting u256 to string

\`str(self.market_count)\` converts the \`u256\` counter to a plain Python string so it can be used as a \`TreeMap\` key. This is the standard pattern for numeric IDs in GenLayer contracts.

### What you have built

After this capstone, PredictX can store an unlimited number of independent prediction markets — each with its own question, outcomes, creator, minimum stake, and status — all inside a single deployed contract. The identity layer (Lessons 1–5) and the market storage layer (Lessons 6–10) are now complete.`,
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
    market_min_stakes: TreeMap[str, u256]

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
    def create_market(self, question: str, outcome_a: str, outcome_b: str, min_stake: u256) -> str:
        assert len(question) > 0, "Question cannot be empty"
        assert len(outcome_a) > 0, "Outcome A cannot be empty"
        assert len(outcome_b) > 0, "Outcome B cannot be empty"
        assert outcome_a != outcome_b, "Outcomes must be different"
        assert min_stake > u256(0), "Minimum stake must be greater than zero"
        market_id = "0"
        self.market_creators[market_id] = gl.message.sender_address
        self.market_questions[market_id] = question
        self.market_outcome_a[market_id] = outcome_a
        self.market_outcome_b[market_id] = outcome_b
        self.market_statuses[market_id] = "active"
        self.market_min_stakes[market_id] = min_stake
        return market_id
`,
  task: "Add `market_count: u256` as a persistent field, initialize it to `u256(0)` in the constructor, replace the hardcoded `\"0\"` ID with `str(self.market_count)`, and increment the counter with `self.market_count += u256(1)` before returning.",
  hints: [
    "Add `market_count: u256` in the class body and `self.market_count = u256(0)` in `__init__`.",
    "Replace `market_id = \"0\"` with `market_id = str(self.market_count)`.",
    "Add `self.market_count += u256(1)` AFTER storing all market data but BEFORE the `return market_id` line.",
  ],
};

export default content;
