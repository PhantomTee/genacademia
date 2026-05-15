import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 9 — Fetching Real Web Content with web.get

Asking the LLM to score a GitHub profile based only on its URL means the model relies entirely on its training data. You can do much better: fetch the actual page content and include it in the prompt, giving the LLM real, current information.

### gl.nondet.web.get

\`\`\`python
content = gl.nondet.web.get(url)
\`\`\`

This performs an HTTP GET and returns the page as a string. Like all \`gl.nondet\` calls, it runs in the nondeterministic execution layer and is subject to consensus verification.

### Practical Usage

GitHub profile pages are large. Truncate the content to keep your prompt manageable:

\`\`\`python
page_content = gl.nondet.web.get(safe_url)
excerpt = page_content[:2000]
prompt = (
    f"Analyse this GitHub developer. "
    f"README/Profile content (first 2000 chars):\\n{excerpt}\\n\\n"
    f"Return JSON: score (0-100), strengths, areas_to_improve."
)
\`\`\`

### Why 2000 Characters?

LLM context windows are finite and longer prompts cost more. 2000 characters is enough to capture a developer's pinned repositories, bio, and recent activity summary — the most signal-rich parts of a GitHub profile page.

### Combining web.get and exec_prompt

This is the classic GenLayer two-step:
1. **Fetch** — get real-world data with \`web.get\`
2. **Reason** — analyse it with \`exec_prompt\`

Together they let your contract make decisions based on live external information.

**Key concepts this lesson:** \`gl.nondet.web.get\`, content truncation, combining fetch and reason.`,
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

    def _safe_url(self, url: str) -> str:
        if not url.startswith("https://github.com/"):
            raise gl.vm.UserError("invalid GitHub URL")
        url = url.split()[0].split('"')[0].split("'")[0]
        return url

    @gl.public.write
    def score_github(self, dev: Address, github_url: str) -> dict:
        safe_url = self._safe_url(github_url)
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Update `score_github()` to fetch the developer's GitHub page with `gl.nondet.web.get`, include the first 2000 characters of the page in the scoring prompt, then call `exec_prompt` with `response_format=\"json\"` and return the result.",
  hints: [
    "After getting `safe_url`, call `page_content = gl.nondet.web.get(safe_url)` to fetch the page.",
    "Truncate with `excerpt = page_content[:2000]` and embed it in the prompt as `'README: {excerpt}'`.",
    "Call `gl.nondet.exec_prompt(prompt, response_format=\"json\")` and return the dict result.",
  ],
};

export default content;
