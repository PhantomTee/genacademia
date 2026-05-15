import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 14,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 14 — State Machines: Developer Status

Real registries need status transitions. A developer starts as \`UNVERIFIED\`, can be promoted to \`VERIFIED\` by the curator, or demoted to \`SUSPENDED\` for misconduct. This is a classic **state machine** pattern.

### Defining States

Use string constants for clarity and safety:

\`\`\`python
UNVERIFIED = "UNVERIFIED"
VERIFIED = "VERIFIED"
SUSPENDED = "SUSPENDED"
\`\`\`

Adding a \`status\` field to \`DevProfile\` keeps all developer data in one place:

\`\`\`python
@dataclass
class DevProfile:
    handle: str
    github_url: str
    score: int = 0
    endorsements: int = 0
    verified: bool = False
    status: str = "UNVERIFIED"
\`\`\`

### Enforcing Valid Transitions

Only allow transitions that make logical sense. The curator should only be able to verify a developer who is currently UNVERIFIED, and only suspend one who is VERIFIED:

\`\`\`python
if profile.status != "UNVERIFIED":
    raise gl.vm.UserError("developer is not in UNVERIFIED state")
profile.status = "VERIFIED"
self.developers[dev] = profile
\`\`\`

### Why State Machines Matter

State machines prevent nonsensical transitions (e.g., suspending an already-suspended developer) and create an auditable trail of status changes on-chain.

**Key concepts this lesson:** status fields, state machine transitions, curator-only writes.`,
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
        pass

    @gl.public.write
    def suspend(self, dev: Address) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `verify_developer()` (curator only, sets status to VERIFIED from UNVERIFIED) and `suspend()` (curator only, sets status to SUSPENDED from VERIFIED).",
  hints: [
    "Both functions should start with `if gl.message.sender_address != self.curator: raise gl.vm.UserError('only curator')`.",
    "Retrieve the profile with `profile = self.developers[dev]`, check the current `profile.status`, then set the new value.",
    "Remember to re-assign `self.developers[dev] = profile` after modifying the profile object.",
  ],
};

export default content;
