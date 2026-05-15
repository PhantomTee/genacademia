import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 15 — Capstone: Full Data Structures

You now have dataclasses, state machines, TreeMaps, and curator controls. This capstone makes all developer profile data queryable through a single clean API: \`get_developer_profile()\`.

### Returning Dicts from Contracts

Contracts can return \`dict\` objects which are ABI-encoded as JSON for clients. This is ideal for profile queries — the caller gets all fields in one call:

\`\`\`python
@gl.public.view
def get_developer_profile(self, dev: Address) -> dict:
    profile = self.developers.get(dev, None)
    if profile is None:
        raise gl.vm.UserError("developer not found")
    return {
        "handle": profile.handle,
        "github_url": profile.github_url,
        "score": profile.score,
        "status": profile.status,
        "endorsements": profile.endorsements,
    }
\`\`\`

Note that \`Address\` values should be converted to \`str\` for JSON serialisation.

### Capstone Checklist

Your CodeVault contract should now support the complete developer lifecycle:
1. **Register** — developer creates profile (UNVERIFIED)
2. **Score** — curator or AI assigns a score
3. **Verify** — curator promotes to VERIFIED
4. **Suspend** — curator demotes to SUSPENDED
5. **Query** — anyone reads the full profile dict

### Design Principles

Every state transition emits clear errors, all privileged operations check the curator, and the profile dict gives clients a single stable API surface regardless of how internal storage evolves.

**Key concepts this lesson:** dict serialisation, full lifecycle integration, profile query API.`,
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

    @gl.public.write
    def suspend(self, dev: Address) -> None:
        if gl.message.sender_address != self.curator:
            raise gl.vm.UserError("only curator")
        profile = self.developers[dev]
        if profile.status != "VERIFIED":
            raise gl.vm.UserError("developer is not VERIFIED")
        profile.status = "SUSPENDED"
        self.developers[dev] = profile

    @gl.public.view
    def get_developer_profile(self, dev: Address) -> dict:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `get_developer_profile(dev)` to return a dict with keys `handle`, `github_url`, `score`, `status`, and `endorsements` for the given developer. Raise a `UserError` if the developer is not found.",
  hints: [
    "Use `profile = self.developers.get(dev, None)` and check if it is `None` before accessing fields.",
    "Raise `gl.vm.UserError('developer not found')` if the profile doesn't exist.",
    "Return `{'handle': profile.handle, 'github_url': profile.github_url, 'score': profile.score, 'status': profile.status, 'endorsements': profile.endorsements}`.",
  ],
};

export default content;
