import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 12 — json.dumps Views: Frontend-Friendly JSON Output

GenLayer view methods return Python values. To serve structured data to frontends, use \`json.dumps({...})\` which converts a Python dict to a JSON string. Add \`import json\` at the top of the file.

Use \`sort_keys=True\` for consistent, predictable key ordering:

\`\`\`python
import json

return json.dumps({"key": "value"}, sort_keys=True)
\`\`\`

**Type conversions required:**
- Addresses must be converted to strings: \`self.market_creators[market_id].as_hex\`
- \`u256\` numbers must be converted to strings: \`str(self.market_min_stakes[market_id])\`

Always guard against missing markets before reading their data:

\`\`\`python
assert market_id in self.market_questions, "Market not found"
\`\`\`

This pattern — validate, build a dict, return \`json.dumps\` — is the standard for any structured view across all GenLayer contracts.`,
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
    market_min_stakes: TreeMap[str, u256]
    market_statuses: TreeMap[str, str]
    market_count: u256
    market_ids: DynArray[str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."
        self.market_count = u256(0)

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

        market_id = str(self.market_count)

        self.market_creators[market_id] = gl.message.sender_address
        self.market_questions[market_id] = question
        self.market_outcome_a[market_id] = outcome_a
        self.market_outcome_b[market_id] = outcome_b
        self.market_min_stakes[market_id] = min_stake
        self.market_statuses[market_id] = "active"

        self.market_count += u256(1)
        self.market_ids.append(market_id)

        return market_id
`,
  task: "Add `import json` at the top, then add a view method `get_market_json(self, market_id: str) -> str` that asserts the market exists and returns a JSON string with fields: id, creator (as hex), question, outcome_a, outcome_b, min_stake (as string), and status.",
  hints: [
    "Add `import json` before `from genlayer import *` at the top of the file.",
    "Guard against missing markets: `assert market_id in self.market_questions, \"Market not found\"`",
    "Return `json.dumps({\"id\": market_id, \"creator\": self.market_creators[market_id].as_hex, ...}, sort_keys=True)` with all required fields.",
  ],
};

export default content;
