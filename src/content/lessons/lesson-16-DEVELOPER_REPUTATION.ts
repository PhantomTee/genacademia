import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 16 — run_nondet_unsafe: Custom Consensus Logic

GenLayer's default consensus checks whether validator results match the leader's within a tolerance. Sometimes you need **custom validation logic** — for example, ensuring a GitHub score is a plausible integer in range, not just numerically similar. \`gl.vm.run_nondet_unsafe\` gives you full control.

### The Pattern

\`\`\`python
def _leader_score(self, github_url: str):
    page = gl.nondet.web.get(github_url)
    prompt = f"Score this GitHub profile 0-100. Content: {page[:2000]}"
    return gl.nondet.exec_prompt(prompt, response_format="json")

def _validate_score(self, result) -> bool:
    if not isinstance(result, dict):
        return False
    score = result.get("score")
    return isinstance(score, int) and 0 <= score <= 100

@gl.public.write
def score_github(self, dev: Address, github_url: str) -> dict:
    safe_url = self._safe_url(github_url)
    result = gl.vm.run_nondet_unsafe(
        lambda: self._leader_score(safe_url),
        lambda r: self._validate_score(r)
    )
    self.developers[dev].score = result["score"]
    return result
\`\`\`

### Leader vs Validator

- **Leader function** — runs on the proposing node; does all the work (fetch + LLM)
- **Validator function** — runs on every validator; receives the leader's output and returns \`True\` if it's acceptable

The validator must be deterministic and cheap — it should not re-run the expensive fetch+LLM; it just checks plausibility.

### Your Mission

Implement \`_leader_score\` and \`_validate_score\`, and wire them into \`score_github\` via \`run_nondet_unsafe\`.

**Key concepts this lesson:** \`run_nondet_unsafe\`, leader/validator split, custom consensus.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


@dataclass
class DevProfile:
    handle: str
    github_url: str
    score: int = 0
    endorsements: int = 0
    verified: bool = False
    status: str = "UNVERIFIED"


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    curator: Address
    registry_id: u256
    active: bool
    developers: TreeMap[Address, DevProfile]

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.view
    def get_curator(self) -> str:
        return str(self.curator)

    @gl.public.write
    def register(self, handle: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.developers.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already registered")
        profile = DevProfile(handle=handle, github_url="")
        self.developers[gl.message.sender_address] = profile
        self.developer_count += 1

    def _safe_url(self, url: str) -> str:
        if not url.startswith("https://github.com/"):
            raise gl.vm.UserError("invalid GitHub URL")
        url = url.split()[0].split('"')[0].split("'")[0]
        return url

    def _leader_score(self, github_url: str):
        pass

    def _validate_score(self, result) -> bool:
        pass

    @gl.public.write
    def score_github(self, dev: Address, github_url: str) -> dict:
        safe_url = self._safe_url(github_url)
        result = gl.vm.run_nondet_unsafe(
            lambda: self._leader_score(safe_url),
            lambda r: self._validate_score(r)
        )
        profile = self.developers[dev]
        profile.score = result["score"]
        self.developers[dev] = profile
        return result

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `_leader_score()` (fetch the page with web.get and call exec_prompt for a JSON score+strengths result) and `_validate_score()` (return True only if result is a dict with score as an int between 0 and 100).",
  hints: [
    "In `_leader_score`: call `gl.nondet.web.get(github_url)`, build a prompt with the page content, then return `gl.nondet.exec_prompt(prompt, response_format='json')`.",
    "In `_validate_score`: check `isinstance(result, dict)` first, then `isinstance(result.get('score'), int) and 0 <= result['score'] <= 100`.",
    "Both are private helpers (no decorator needed) — only `score_github` is public.",
  ],
};

export default content;
