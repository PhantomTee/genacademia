import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 7 — Structured AI Responses with JSON Format

In Lesson 6 you asked the LLM for a plain integer. Real applications need richer output — a score **plus** an explanation. \`response_format="json"\` instructs the LLM to return a structured JSON object that GenLayer parses for you.

### Requesting JSON

\`\`\`python
result = gl.nondet.exec_prompt(prompt, response_format="json")
# result is a Python dict
score = result["score"]
strengths = result["strengths"]
\`\`\`

The return value is already a \`dict\` — no \`json.loads()\` needed.

### Designing a Good JSON Prompt

Tell the LLM the exact schema you want:

\`\`\`python
prompt = (
    f"Analyse the GitHub developer profile at {github_url}. "
    f"Return a JSON object with these exact keys: "
    f'score (integer 0-100), '
    f'strengths (one sentence about strengths), '
    f'areas_to_improve (one sentence about areas to improve).'
)
\`\`\`

Being explicit about key names and value types dramatically reduces parsing errors.

### Returning Dicts from Contract Methods

GenLayer contract methods can return \`dict\` objects; the ABI encoder serialises them to JSON for clients:

\`\`\`python
@gl.public.write
def score_github(self, dev: Address, github_url: str) -> dict:
    result = gl.nondet.exec_prompt(prompt, response_format="json")
    return result
\`\`\`

### Your Mission

Update \`score_github()\` to use \`response_format="json"\` and return the full assessment dict containing \`score\`, \`strengths\`, and \`areas_to_improve\`.

**Key concepts this lesson:** \`response_format="json"\`, structured LLM output, dict return types.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    registered: TreeMap[Address, bool]
    curator: Address
    registry_id: u256
    active: bool

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.registered = TreeMap[Address, bool]()
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.view
    def get_curator(self) -> str:
        return str(self.curator)

    @gl.public.view
    def is_active(self) -> bool:
        return self.active

    @gl.public.write
    def pause(self) -> None:
        if gl.message.sender_address != self.curator:
            raise gl.vm.UserError("only curator can pause")
        if not self.active:
            raise gl.vm.UserError("already paused")
        self.active = False

    @gl.public.write
    def register(self, handle: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.registered.get(gl.message.sender_address, False):
            raise gl.vm.UserError("already registered")
        self.registered[gl.message.sender_address] = True
        self.developer_count += 1

    @gl.public.write
    def score_github(self, dev: Address, github_url: str) -> dict:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Update `score_github()` to use `response_format=\"json\"` and return the full assessment dict with keys `score`, `strengths`, and `areas_to_improve`.",
  hints: [
    "Update your prompt to specify the exact JSON schema: `score` (int 0-100), `strengths` (str), `areas_to_improve` (str).",
    "Change the call to `gl.nondet.exec_prompt(prompt, response_format=\"json\")` — the result will already be a dict.",
    "Return the dict directly: `return result`.",
  ],
};

export default content;
