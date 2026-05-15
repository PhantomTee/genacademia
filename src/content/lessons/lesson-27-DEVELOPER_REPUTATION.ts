import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 27,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 27 — Upgradability: Updating the AI Scorer

AI models improve over time. CodeVault's GitHub scoring logic is powerful, but you may want to point it at a newer, better scorer contract without redeploying the whole registry. This is the **upgradable scorer** pattern.

### The Scorer Address Pattern

Store the AI scorer's contract address as mutable state:

\`\`\`python
scorer_contract: Address
scorer_version: int

def __init__(self, ..., scorer: Address) -> None:
    self.scorer_contract = scorer
    self.scorer_version = 1
\`\`\`

### update_scorer Function

Only the curator should be able to swap the scorer — this is a privileged operation:

\`\`\`python
@gl.public.write
def update_scorer(self, new_scorer: Address) -> None:
    if gl.message.sender_address != self.curator:
        raise gl.vm.UserError("only curator")
    zero = Address("0x" + "0" * 40)
    if new_scorer == zero:
        raise gl.vm.UserError("zero address not allowed")
    self.scorer_contract = new_scorer
    self.scorer_version += 1
\`\`\`

### Why Version Tracking?

Incrementing \`scorer_version\` creates an on-chain audit trail — anyone can see that the scorer was updated and how many times. This is important for trust: developers can verify that the scoring methodology changed.

### Exposing the Version

A simple view lets clients query the current scorer setup:

\`\`\`python
@gl.public.view
def get_scorer_version(self) -> int:
    return self.scorer_version
\`\`\`

### Your Mission

Implement \`update_scorer()\` to validate curator access, reject the zero address, update \`scorer_contract\`, and increment \`scorer_version\`.

**Key concepts this lesson:** upgradable contract patterns, version tracking, curator governance.`,
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
    scorer_contract: Address
    scorer_version: int

    def __init__(self, name: str, registry_id: u256, scorer: Address) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()
        self.endorsement_stakes = TreeMap[Address, u256]()
        self.total_endorsement_pool = u256(0)
        self.scorer_contract = scorer
        self.scorer_version = 1

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.view
    def get_curator(self) -> str:
        return str(self.curator)

    @gl.public.view
    def get_scorer_version(self) -> int:
        return self.scorer_version

    @gl.public.write
    def register(self, handle: str, github_url: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.developers.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already registered")
        profile = DevProfile(handle=handle, github_url=github_url)
        self.developers[gl.message.sender_address] = profile
        self.developer_count += 1

    @gl.public.write
    def update_scorer(self, new_scorer: Address) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `update_scorer()` so only the curator can call it, reject the zero address, update `self.scorer_contract` to the new address, and increment `self.scorer_version`.",
  hints: [
    "Check curator access: `if gl.message.sender_address != self.curator: raise gl.vm.UserError('only curator')`.",
    "Reject zero address: `if new_scorer == Address('0x' + '0' * 40): raise gl.vm.UserError('zero address not allowed')`.",
    "Update state: `self.scorer_contract = new_scorer` then `self.scorer_version += 1`.",
  ],
};

export default content;
