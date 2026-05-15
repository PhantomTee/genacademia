import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 6 — Persistent Storage Fields: TreeMap

A single prediction market needs multiple pieces of data: the question, two possible outcomes, the creator address, a minimum stake, and a status. GenLayer doesn't support structs — instead, each field for a market is stored in a **separate \`TreeMap\` keyed by market ID**.

### What is a TreeMap?

A \`TreeMap\` is a persistent ordered key-value map stored on-chain. You declare it like any other state variable:

\`\`\`python
market_questions: TreeMap[str, str]
market_creators: TreeMap[str, Address]
\`\`\`

The first type parameter is the key type, the second is the value type. Common combinations:

| Declaration | Use case |
|---|---|
| \`TreeMap[str, str]\` | Text fields (question, outcome, status) |
| \`TreeMap[str, Address]\` | Creator or owner per market |
| \`TreeMap[str, u256]\` | Numeric values (amounts, counters) |

### TreeMaps do not need initialisation

Unlike regular fields, \`TreeMap\` instances start empty automatically. Do **not** add them to \`__init__\` — they are ready to use the moment you declare them.

\`\`\`python
class PredictX(gl.Contract):
    market_questions: TreeMap[str, str]   # ready to use immediately

    def __init__(self) -> None:
        pass  # no TreeMap init needed
\`\`\`

Reading a missing key returns the zero value for that type (\`""\` for strings, the zero address for \`Address\`, \`u256(0)\` for numbers).`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

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
  task: "Add five class-level storage fields: `market_questions: TreeMap[str, str]`, `market_outcome_a: TreeMap[str, str]`, `market_outcome_b: TreeMap[str, str]`, `market_creators: TreeMap[str, Address]`, and `market_statuses: TreeMap[str, str]`. Do not initialize them in `__init__`.",
  hints: [
    "All five fields are declared at class level with type annotations, just like `owner: Address`.",
    "TreeMaps do not need initialization in `__init__` — they are automatically empty.",
    "The types are: `TreeMap[str, str]` for text fields, `TreeMap[str, Address]` for the creator.",
  ],
};

export default content;
