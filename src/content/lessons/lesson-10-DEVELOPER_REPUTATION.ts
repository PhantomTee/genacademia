import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 10,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 10 — Capstone: Full AI-Powered Scoring Pipeline

You have mastered \`exec_prompt\`, JSON responses, URL sanitisation, and \`web.get\`. This capstone combines all four into a single production-quality function: \`evaluate_and_store\`.

### The Full Pipeline

\`\`\`
github_url → _safe_url → web.get → exec_prompt (JSON) → validate score → store
\`\`\`

Each step builds on the last:
1. **Sanitise** the URL to prevent injection
2. **Fetch** the live profile page
3. **Score** with the LLM using real content
4. **Validate** the result (score must be ≥ 20 — low-quality profiles are rejected)
5. **Store** the score in the developer's on-chain profile

### Minimum Quality Gate

Rejecting profiles with a score below 20 keeps CodeVault's registry meaningful:

\`\`\`python
if result["score"] < 20:
    raise gl.vm.UserError("score too low to register")
\`\`\`

### Storing the Score

Use a \`TreeMap[Address, int]\` to persist scores so they can be queried later:

\`\`\`python
self.scores[dev] = result["score"]
\`\`\`

### Capstone Checklist

- Fetch real GitHub content
- Use JSON exec_prompt for structured output
- Enforce minimum score threshold
- Persist the result on-chain
- Chain all four capabilities seamlessly

**Key concepts this lesson:** pipeline composition, quality gates, on-chain data persistence.`,
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
    scores: TreeMap[Address, int]

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.registered = TreeMap[Address, bool]()
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
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

    def _safe_url(self, url: str) -> str:
        if not url.startswith("https://github.com/"):
            raise gl.vm.UserError("invalid GitHub URL")
        url = url.split()[0].split('"')[0].split("'")[0]
        return url

    @gl.public.write
    def evaluate_and_store(self, github_url: str) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `evaluate_and_store()`: sanitise the URL, fetch the page with `web.get`, call `exec_prompt` for a JSON score+strengths assessment, raise a `UserError` if `score < 20`, and store the score in `self.scores` keyed by the caller's address.",
  hints: [
    "Chain the steps: `safe_url = self._safe_url(github_url)` → `page = gl.nondet.web.get(safe_url)` → `result = gl.nondet.exec_prompt(prompt, response_format='json')`.",
    "After getting `result`, check `if result['score'] < 20: raise gl.vm.UserError('score too low to register')`.",
    "Store the score with `self.scores[gl.message.sender_address] = result['score']`.",
  ],
};

export default content;
