import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 7 — \`Address\` & \`gl.message.sender_address\`

\`gl.message.sender_address\` is the wallet address of whoever called the current method. In \`__init__\`, it is the deployer. In \`create_market\`, it is the person creating the market. You can store it, compare it, or return it just like any other \`Address\` value.

### Writing to a TreeMap

Assigning to a \`TreeMap\` entry uses standard dict-style syntax:

\`\`\`python
self.market_creators[market_id] = gl.message.sender_address
self.market_questions[market_id] = question
self.market_statuses[market_id] = "active"
\`\`\`

### Stub with a hardcoded ID

This lesson adds a \`create_market\` stub that uses the hard-coded ID \`"0"\` for now. That means every call to \`create_market\` overwrites the same slot — which is intentional. The real counter-based ID generation comes in Lesson 10. For now, focus on correctly writing all five fields into their TreeMaps and returning the ID.

\`\`\`python
@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:
    market_id = "0"
    self.market_creators[market_id] = gl.message.sender_address
    self.market_questions[market_id] = question
    self.market_outcome_a[market_id] = outcome_a
    self.market_outcome_b[market_id] = outcome_b
    self.market_statuses[market_id] = "active"
    return market_id
\`\`\`

Return type is \`str\` — the caller receives the ID of the newly created market.`,
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
`,
  task: "Add a `@gl.public.write` method `create_market(self, question: str, outcome_a: str, outcome_b: str) -> str` that sets `market_id = \"0\"`, stores the creator address, question, outcome_a, outcome_b, and status `\"active\"` in the respective TreeMaps, then returns `market_id`.",
  hints: [
    "Use `@gl.public.write` and return type `str` (the market ID).",
    "Store the creator with: `self.market_creators[market_id] = gl.message.sender_address`",
    "Set the initial status: `self.market_statuses[market_id] = \"active\"` and return `market_id` at the end.",
  ],
};

export default content;
