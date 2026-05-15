import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 20 — Capstone: Advanced AI Scoring

This capstone combines everything from Lessons 16–19: \`web.get\`, \`web.render\`, multi-modal \`exec_prompt\`, and \`run_nondet_unsafe\` into a single production-quality \`score_github\` function.

### The Advanced Pipeline

\`\`\`
_safe_url
    ↓
_leader_score (leader only):
    web.get(url)  →  text content
    web.render(url)  →  screenshot bytes
    exec_prompt(prompt, images=[screenshot], response_format="json")
    ↓
_validate_score (every validator):
    check dict keys, score range, string fields
    ↓
store result["score"] in profile
\`\`\`

### Why Both Text and Visual?

- The **text** (web.get) captures README quality, repository descriptions, and bio text
- The **screenshot** (web.render) captures visual profile presentation and contribution graph

Giving the LLM both signals produces a more holistic assessment than either alone.

### Capstone Checklist

By the end of this lesson your \`score_github\` should:
1. Use \`run_nondet_unsafe\` for custom consensus
2. Leader fetches both text and screenshot
3. Leader sends both to LLM with image support
4. Validator checks score plausibility non-comparatively
5. Store the resulting score in the developer's profile

**Key concepts this lesson:** full pipeline integration, text+visual AI, run_nondet_unsafe capstone.`,
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
    def register(self, handle: str, github_url: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.developers.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already registered")
        profile = DevProfile(handle=handle, github_url=github_url)
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
        if not isinstance(result, dict):
            return False
        for key in ("score", "strengths", "areas_to_improve"):
            if key not in result:
                return False
        score = result.get("score")
        if not isinstance(score, int) or not (0 <= score <= 100):
            return False
        if not isinstance(result["strengths"], str) or not result["strengths"]:
            return False
        if not isinstance(result["areas_to_improve"], str) or not result["areas_to_improve"]:
            return False
        return True

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
  task: "Implement `_leader_score()` to fetch both the page text with `web.get` AND the screenshot with `web.render`, then call `exec_prompt` with both text content and the screenshot image for a JSON score+strengths result.",
  hints: [
    "Fetch text: `page = gl.nondet.web.get(github_url)` and screenshot: `screenshot = gl.nondet.web.render(github_url)`.",
    "Build a prompt including `page[:2000]` and call `gl.nondet.exec_prompt(prompt, images=[screenshot], response_format='json')`.",
    "Return the result dict from `_leader_score` — the outer `score_github` stores the score via `run_nondet_unsafe`.",
  ],
};

export default content;
