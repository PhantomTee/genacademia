import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 30,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 30 — Final Capstone: Ship CodeVault

You have built every piece of CodeVault across 29 lessons. This final lesson ties it all together with one last view function: \`get_registry_stats()\`. A clean stats endpoint is the hallmark of a production-ready contract — it lets dashboards, indexers, and monitoring tools query the contract's health in a single call.

### Returning a Dict from a View

GenLayer view functions can return plain Python dicts. All values must be JSON-serialisable:

\`\`\`python
@gl.public.view
def get_registry_stats(self) -> dict:
    return {
        "registry_name": self.registry_name,
        "curator": str(self.curator),
        "developer_count": self.developer_count,
        "endorsement_pool": int(self.endorsement_pool),
        "version": self.version,
    }
\`\`\`

### Type Conversions

Two conversions are important here:

- **\`Address → str\`**: \`Address\` is an opaque type; callers expect a hex string. Use \`str(self.curator)\`.
- **\`u256 → int\`**: \`u256\` is a GenLayer numeric type. Wrap it with \`int()\` so JSON serialisation works reliably.

### What Makes a Good Stats Endpoint

A stats dict should be:
- **Stable** — same keys every call; callers can rely on the schema
- **Cheap** — pure view, no writes, no AI calls
- **Complete** — enough info for a dashboard to display the contract's state without additional calls

CodeVault's five-key response covers identity (\`registry_name\`, \`curator\`, \`version\`), usage (\`developer_count\`), and economics (\`endorsement_pool\`).

### Completing the Journey

With \`get_registry_stats()\` in place, CodeVault exposes:
- Registration and verification of developer profiles
- AI-powered GitHub scoring via non-deterministic execution
- Staked endorsements with GEN transfers
- Curator governance and upgradable scorer pattern
- Debug observability and special message/value handlers
- A clean stats API for external consumers

Congratulations — CodeVault is ready to ship.

**Key concepts this lesson:** multi-field dict views, type conversion for JSON, production API design.`,
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
    endorsement_pool: u256
    version: str

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()
        self.endorsement_stakes = TreeMap[Address, u256]()
        self.total_endorsement_pool = u256(0)
        self.endorsement_pool = u256(0)
        self.version = "1.0.0"

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
        gl.emit_debug(f"register: handle={handle} addr={str(gl.message.sender_address)}")

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
        gl.emit_debug(f"score: dev={str(dev)} url={github_url} score={result['score']}")
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
        gl.emit_debug(f"verify: dev={str(dev)} by={str(gl.message.sender_address)}")

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count

    def __receive_message__(self, message: str) -> None:
        if message == "stats":
            gl.emit_debug(
                f"stats: {self.developer_count} devs, pool={self.endorsement_pool}"
            )

    def __receive_value__(self, amount: u256) -> None:
        self.endorsement_pool += amount

    @gl.public.view
    def get_registry_stats(self) -> dict:
        pass
`,
  task: "Implement `get_registry_stats()` to return a dict with five keys: `registry_name`, `curator` (as a string), `developer_count`, `endorsement_pool` (as an int), and `version`.",
  hints: [
    "Return a plain Python dict — no special GenLayer type needed. Five keys: `registry_name`, `curator`, `developer_count`, `endorsement_pool`, `version`.",
    "Convert `Address` to string with `str(self.curator)` and `u256` to int with `int(self.endorsement_pool)` so the dict is JSON-serialisable.",
    `Full solution: \`return {"registry_name": self.registry_name, "curator": str(self.curator), "developer_count": self.developer_count, "endorsement_pool": int(self.endorsement_pool), "version": self.version}\``,
  ],
};

export default content;
