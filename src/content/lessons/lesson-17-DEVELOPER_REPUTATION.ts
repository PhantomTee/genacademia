import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 17,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 17 — Non-Comparative Validation

In Lesson 16 you introduced \`run_nondet_unsafe\` with a basic type check. Now let's strengthen the validator to perform proper **non-comparative** plausibility checking.

### What is Non-Comparative?

A *comparative* validator would re-run the LLM and compare results — that's expensive and defeats the purpose. A *non-comparative* validator checks that the leader's output is structurally and semantically plausible without re-doing the work.

### Full Plausibility Check

For a GitHub scoring result, a complete validator checks:

\`\`\`python
def _validate_score(self, result) -> bool:
    if not isinstance(result, dict):
        return False
    # Required keys present
    for key in ("score", "strengths", "areas_to_improve"):
        if key not in result:
            return False
    # Score is an integer in valid range
    score = result["score"]
    if not isinstance(score, int) or not (0 <= score <= 100):
        return False
    # Text fields are non-empty strings
    if not isinstance(result["strengths"], str) or not result["strengths"]:
        return False
    if not isinstance(result["areas_to_improve"], str) or not result["areas_to_improve"]:
        return False
    return True
\`\`\`

### Why Thoroughness Matters

A malicious leader node could return a forged result (e.g., \`{"score": 100}\`) with missing fields. Checking all required keys and types ensures validators catch malformed outputs.

### Your Mission

Update \`_validate_score()\` to check that the result dict contains all three required keys with correct types, and that the score is an integer in the range 0–100.

**Key concepts this lesson:** non-comparative validation, required-key checks, type assertions.`,
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
        page = gl.nondet.web.get(github_url)
        prompt = (
            f"Analyse this GitHub profile. Content: {page[:2000]}\\n"
            f"Return JSON: score (0-100), strengths (str), areas_to_improve (str)."
        )
        return gl.nondet.exec_prompt(prompt, response_format="json")

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
  task: "Implement `_validate_score()` to non-comparatively validate the result: check it's a dict, contains all three keys (`score`, `strengths`, `areas_to_improve`), that `score` is an int in 0–100, and that the string fields are non-empty.",
  hints: [
    "Start with `if not isinstance(result, dict): return False`, then check for each required key using `if key not in result`.",
    "Validate the score: `score = result.get('score'); if not isinstance(score, int) or not (0 <= score <= 100): return False`.",
    "Check string fields: `if not isinstance(result['strengths'], str) or not result['strengths']: return False`. Then `return True`.",
  ],
};

export default content;
