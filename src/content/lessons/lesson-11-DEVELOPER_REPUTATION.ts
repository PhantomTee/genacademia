import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 11,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 11 — TreeMap: Efficient On-Chain Mappings

As CodeVault grows, you need to store structured data per developer — their handle, score, and more. \`TreeMap\` is GenLayer's ordered key-value store, designed for efficient on-chain persistence.

### TreeMap Basics

\`\`\`python
from genlayer.types import TreeMap, Address

developers: TreeMap[Address, str]    # address → handle
scores: TreeMap[Address, int]        # address → score

def __init__(self, ...) -> None:
    self.developers = TreeMap[Address, str]()
    self.scores = TreeMap[Address, int]()
\`\`\`

### Reading and Writing

\`\`\`python
# Write
self.developers[gl.message.sender_address] = handle

# Read with default (safe for missing keys)
score = self.scores.get(dev, 0)

# Read (raises KeyError if missing)
handle = self.developers[dev]
\`\`\`

Always use \`.get(key, default)\` when the key might not exist to avoid runtime errors.

### Upgrading register()

Now that you have a \`developers\` map, \`register()\` should store the handle alongside the boolean registration flag:

\`\`\`python
self.developers[gl.message.sender_address] = handle
\`\`\`

### get_score View

Expose a view that returns a developer's score, defaulting to 0 if they haven't been scored yet — this is the safe pattern for optional state.

**Key concepts this lesson:** \`TreeMap\`, key-value state, safe reads with \`.get()\`.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    curator: Address
    registry_id: u256
    active: bool
    developers: TreeMap[Address, str]
    scores: TreeMap[Address, int]

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, str]()
        self.scores = TreeMap[Address, int]()

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
    def register(self, handle: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.developers.get(gl.message.sender_address, ""):
            raise gl.vm.UserError("already registered")
        self.developers[gl.message.sender_address] = handle
        self.developer_count += 1

    def _safe_url(self, url: str) -> str:
        if not url.startswith("https://github.com/"):
            raise gl.vm.UserError("invalid GitHub URL")
        url = url.split()[0].split('"')[0].split("'")[0]
        return url

    @gl.public.write
    def score_github(self, dev: Address, github_url: str) -> dict:
        safe_url = self._safe_url(github_url)
        page = gl.nondet.web.get(safe_url)
        prompt = (
            f"Analyse this GitHub profile. Content: {page[:2000]}\\n"
            f"Return JSON: score (0-100), strengths (str), areas_to_improve (str)."
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        self.scores[dev] = result["score"]
        return result

    @gl.public.view
    def get_score(self, dev: Address) -> int:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `get_score(dev)` to return the developer's score from `self.scores`, defaulting to `0` if they have not been scored yet.",
  hints: [
    "Use `self.scores.get(dev, 0)` to safely retrieve the score with a default of 0.",
    "The method is a `@gl.public.view` — it should only read, never write.",
    "The complete body is `return self.scores.get(dev, 0)`.",
  ],
};

export default content;
