import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 28,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 28 — Debugging with emit_debug

Production contracts are hard to debug — you can't attach a debugger or print to a console. \`gl.emit_debug\` is GenLayer's solution: it emits structured debug messages that appear in node logs and development tooling without affecting consensus or state.

### Basic Usage

\`\`\`python
gl.emit_debug(f"register: {handle} by {str(gl.message.sender_address)}")
\`\`\`

Debug messages are:
- **Free** — they don't cost extra gas
- **Invisible to consensus** — validators ignore them
- **Visible in dev tools** — show up in the Studio and node logs
- **Removed in production** — can be stripped for mainnet deployments

### What to Debug

The three most important events to trace in CodeVault are:

1. **Registration** — who registered and with what handle
2. **Scoring** — what score a developer received and from what URL
3. **Verification** — when a developer's status changes

\`\`\`python
# In register()
gl.emit_debug(f"register: handle={handle} addr={str(gl.message.sender_address)}")

# In score_github()
gl.emit_debug(f"score: dev={str(dev)} url={github_url} score={result['score']}")

# In verify_developer()
gl.emit_debug(f"verify: dev={str(dev)} by curator={str(gl.message.sender_address)}")
\`\`\`

### Best Practices

Include enough context to diagnose issues: the function name, key parameters, and the outcome. Avoid logging sensitive data (private keys, personal info).

### Your Mission

Add \`gl.emit_debug\` calls to \`register()\`, \`score_github()\`, and \`verify_developer()\` with informative messages including the relevant addresses and values.

**Key concepts this lesson:** \`gl.emit_debug\`, observability, debugging strategies.`,
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
    endorsement_stakes: TreeMap[Address, u256]
    total_endorsement_pool: u256

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()
        self.endorsement_stakes = TreeMap[Address, u256]()
        self.total_endorsement_pool = u256(0)

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
        pass  # TODO: add emit_debug here

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
        profile = self.developers[dev]
        profile.score = result["score"]
        self.developers[dev] = profile
        pass  # TODO: add emit_debug here
        return result

    @gl.public.write
    def verify_developer(self, dev: Address) -> None:
        if gl.message.sender_address != self.curator:
            raise gl.vm.UserError("only curator")
        profile = self.developers[dev]
        if profile.status != "UNVERIFIED":
            raise gl.vm.UserError("developer is not UNVERIFIED")
        profile.status = "VERIFIED"
        profile.verified = True
        self.developers[dev] = profile
        pass  # TODO: add emit_debug here

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Replace the three `pass  # TODO: add emit_debug here` comments with `gl.emit_debug(...)` calls that log the handle/address in `register()`, the dev address and score in `score_github()`, and the dev address in `verify_developer()`.",
  hints: [
    "In `register()`: `gl.emit_debug(f'register: handle={handle} addr={str(gl.message.sender_address)}')`.",
    "In `score_github()`: `gl.emit_debug(f'score: dev={str(dev)} url={github_url} score={result[\"score\"]}')`.",
    "In `verify_developer()`: `gl.emit_debug(f'verify: dev={str(dev)} by={str(gl.message.sender_address)}')`.",
  ],
};

export default content;
