import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 7 — Structured JSON Responses

Plain YES/NO is useful, but PredictX benefits from richer data: we also want the model's **confidence** level so we can reject low-confidence resolutions. GenLayer supports this with \`response_format="json"\`.

When you pass \`response_format="json"\`, \`exec_prompt\` returns a Python \`dict\` instead of a string. Structure the prompt to describe the exact JSON schema you expect:

\`\`\`python
prompt = """Has ETH exceeded $10,000 by December 31, 2025?
Respond with JSON: {"verdict": "YES or NO", "confidence": 0-100}"""

result = gl.nondet.exec_prompt(prompt, response_format="json")
self.resolution = result["verdict"]
self.confidence = int(result["confidence"])
\`\`\`

The consensus layer compares the structured output across validators, so all nodes must agree on both fields. Describe the schema precisely in the prompt — vague instructions lead to varying structures and failed consensus.

Adding a \`confidence\` field opens the door to quality gates: in Lesson 10 you'll require confidence ≥ 70 before storing a resolution, preventing the market from settling on uncertain AI outputs. This is a powerful pattern for production prediction markets.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256


class PredictionMarket(gl.Contract):
    question: str
    bet_count: int
    last_bettor: Address
    owner: Address
    market_id: u256
    is_open: bool
    resolution: str
    confidence: int

    def __init__(self, question: str, market_id: u256) -> None:
        self.question = question
        self.bet_count = 0
        self.owner = gl.message.sender_address
        self.market_id = market_id
        self.is_open = True
        self.resolution = ""
        self.confidence = 0

    @gl.public.view
    def get_question(self) -> str:
        return self.question

    @gl.public.view
    def get_owner(self) -> str:
        return str(self.owner)

    @gl.public.write
    def place_bet(self, outcome: str) -> None:
        if outcome not in ["YES", "NO"]:
            raise gl.vm.UserError("outcome must be YES or NO")
        self.bet_count += 1
        self.last_bettor = gl.message.sender_address

    @gl.public.view
    def get_bet_count(self) -> int:
        return self.bet_count

    @gl.public.write
    def cancel(self) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("unauthorized")
        if not self.is_open:
            raise gl.vm.UserError("already cancelled")
        self.is_open = False

    @gl.public.write
    def resolve(self) -> None:
        # TODO: use response_format="json" to get {"verdict": "YES/NO", "confidence": 0-100}
        # Store result["verdict"] in self.resolution and int(result["confidence"]) in self.confidence
        prompt = "Has ETH exceeded $10,000 by December 31, 2025? Answer YES or NO only."
        self.resolution = gl.nondet.exec_prompt(prompt).strip().upper()
`,
  task: "Update `resolve()` to use `response_format=\"json\"` asking for `{\"verdict\": \"YES or NO\", \"confidence\": 0-100}`, then store both fields in `self.resolution` and `self.confidence`.",
  hints: [
    "Add `response_format=\"json\"` as the second argument to `exec_prompt` — the return value is a dict, not a string.",
    "Update the prompt to describe the exact JSON structure: `'Respond with JSON: {\"verdict\": \"YES or NO\", \"confidence\": 0-100}'`",
    "`result = gl.nondet.exec_prompt(prompt, response_format=\"json\"); self.resolution = result[\"verdict\"]; self.confidence = int(result[\"confidence\"])`",
  ],
};

export default content;
