import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 29,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 29 — Special Methods: Receiving GEN and Messages

GenLayer contracts can react to two special events that ordinary functions cannot handle: receiving raw GEN transfers and receiving string messages from other contracts. These are implemented through two reserved method names that the runtime calls automatically.

### \`__receive_value__\`

When another account sends GEN directly to your contract address (without calling a specific function), the runtime invokes:

\`\`\`python
def __receive_value__(self, amount: u256) -> None:
    self.endorsement_pool += amount
\`\`\`

\`amount\` is the wei value of the incoming transfer. Without this handler, a bare transfer would be rejected. CodeVault uses this to accept contributions into its endorsement pool — anyone can top up the pool simply by sending GEN to the contract address.

### \`__receive_message__\`

When another **contract** sends a plain string message (not a regular function call), the runtime invokes:

\`\`\`python
def __receive_message__(self, message: str) -> None:
    if message == "stats":
        gl.emit_debug(
            f"stats: {self.developer_count} devs, pool={self.endorsement_pool}"
        )
\`\`\`

This is useful for lightweight inter-contract signalling — a monitoring contract can ping CodeVault with \`"stats"\` and read the debug output in tooling. Other messages can be silently ignored or trigger additional logic.

### Differences from Regular Write Methods

| | Regular \`@gl.public.write\` | Special handler |
|---|---|---|
| Caller | Any account | Runtime (on transfer / message) |
| Decorator | \`@gl.public.write\` | None — name is the hook |
| Parameters | Arbitrary | Fixed signature |

### Your Mission

Implement \`__receive_value__\` to accumulate received GEN in \`self.endorsement_pool\`, and implement \`__receive_message__\` to emit a debug stat line when the message equals \`"stats"\`.

**Key concepts this lesson:** \`__receive_value__\`, \`__receive_message__\`, contract interoperability, endorsement pool pattern.`,
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
        pass

    def __receive_value__(self, amount: u256) -> None:
        pass
`,
  task: "Implement `__receive_value__` to add the received `amount` to `self.endorsement_pool`. Implement `__receive_message__` to check if `message == \"stats\"` and, if so, emit a debug line reporting `self.developer_count` and `self.endorsement_pool`.",
  hints: [
    "`__receive_value__(self, amount: u256)` is called automatically by the runtime whenever GEN is sent directly to the contract address — no decorator needed.",
    "`__receive_message__(self, message: str)` is called when another contract sends a plain string; use an `if message == \"stats\":` check to branch on the message content.",
    "Full solution: `self.endorsement_pool += amount` in `__receive_value__`; `if message == \"stats\": gl.emit_debug(f\"stats: {self.developer_count} devs, pool={self.endorsement_pool}\")` in `__receive_message__`.",
  ],
};

export default content;
