import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 6 — AI Scoring with exec_prompt

This is where GenLayer becomes truly unique. \`gl.nondet.exec_prompt\` lets your contract send a prompt to an LLM and receive a response — all verified by the network's consensus mechanism.

### Why Nondeterministic?

LLM responses vary between calls. GenLayer handles this through **optimistic concurrency**: the leader node runs the prompt, validators re-run it and check that their result is within acceptable bounds. The consensus rules (explored later with \`run_nondet_unsafe\`) decide if results are "close enough."

### Basic Usage

\`\`\`python
result = gl.nondet.exec_prompt(
    "Rate this repository 0-100. Return only the integer.",
    response_format="text"
)
score = int(result.strip())
\`\`\`

The \`response_format="text"\` returns a raw string. Always \`.strip()\` before converting, as the LLM may add whitespace.

### Scoring GitHub Profiles

A well-crafted prompt makes all the difference:

\`\`\`python
prompt = (
    f"Score this GitHub developer profile on a scale of 0 to 100 based on "
    f"repository activity, contribution quality, and project diversity. "
    f"The profile URL is: {github_url}. "
    f"Return ONLY an integer between 0 and 100, nothing else."
)
\`\`\`

Be explicit about the output format — ask for "only" the number to avoid prose in the response.

### Your Mission

Implement \`score_github()\` to call \`gl.nondet.exec_prompt\` with a prompt asking the LLM to score a GitHub profile 0-100, and return the resulting integer.

**Key concepts this lesson:** \`gl.nondet.exec_prompt\`, \`response_format="text"\`, prompt engineering.`,
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
    def score_github(self, dev: Address, github_url: str) -> int:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `score_github()` to call `gl.nondet.exec_prompt` with a prompt asking the LLM to score the GitHub profile 0-100, parse the result as an integer, and return it.",
  hints: [
    "Build a prompt string that includes the GitHub URL and asks for a score of 0-100. Tell the LLM to return only the number.",
    "Call `gl.nondet.exec_prompt(prompt, response_format=\"text\")` and capture the result string.",
    "Convert the result with `int(result.strip())` and return it.",
  ],
};

export default content;
