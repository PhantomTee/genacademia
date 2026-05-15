import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 21,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 21 — Payable Functions: Endorsement Stakes

In Lesson 21, endorsers put skin in the game. A \`@gl.public.write.payable\` function receives GEN tokens alongside the transaction — these are locked in the contract as a stake.

### Payable Decorator

\`\`\`python
@gl.public.write.payable
def endorse(self, dev: Address) -> None:
    ...
\`\`\`

Inside a payable function, \`gl.message.value\` holds the amount of wei sent:

\`\`\`python
stake = gl.message.value   # u256, in wei
\`\`\`

### Minimum Stake

Require a minimum stake to prevent zero-cost spam endorsements:

\`\`\`python
MIN_STAKE = 10 ** 16  # 0.01 GEN in wei

if gl.message.value < MIN_STAKE:
    raise gl.vm.UserError("stake too low — minimum 0.01 GEN")
\`\`\`

### Storing Stakes

A \`TreeMap[Address, u256]\` tracks cumulative endorsement stakes per developer:

\`\`\`python
endorsement_stakes: TreeMap[Address, u256]

# Add to existing stake
current = self.endorsement_stakes.get(dev, u256(0))
self.endorsement_stakes[dev] = current + gl.message.value
\`\`\`

### Profile Endorsement Count

Also increment the developer's endorsement counter in their \`DevProfile\`:

\`\`\`python
profile.endorsements += 1
self.developers[dev] = profile
\`\`\`

### Your Mission

Make \`endorse()\` payable, require at least 0.01 GEN (10¹⁶ wei), add the stake to \`endorsement_stakes\`, and increment the profile's endorsement count.

**Key concepts this lesson:** \`@gl.public.write.payable\`, \`gl.message.value\`, staking pattern.`,
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

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()
        self.endorsement_stakes = TreeMap[Address, u256]()

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

    @gl.public.write.payable
    def endorse(self, dev: Address) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `endorse()` as a payable function: require at least 10**16 wei, add the stake to `self.endorsement_stakes[dev]`, and increment `profile.endorsements` in the developer's profile.",
  hints: [
    "Check `if gl.message.value < 10**16: raise gl.vm.UserError('stake too low — minimum 0.01 GEN')`.",
    "Add the stake: `current = self.endorsement_stakes.get(dev, u256(0)); self.endorsement_stakes[dev] = current + gl.message.value`.",
    "Retrieve the profile, increment `profile.endorsements += 1`, then re-assign `self.developers[dev] = profile`.",
  ],
};

export default content;
