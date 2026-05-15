import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 22 — gl.send: Sending GEN Tokens

Staking is only half the picture — you also need to send tokens out. \`gl.send\` transfers GEN from the contract's balance to a recipient address.

### Basic Usage

\`\`\`python
gl.send(recipient, amount)
\`\`\`

- \`recipient\` — an \`Address\`
- \`amount\` — a \`u256\` in wei

The transfer is atomic: if the contract doesn't have enough balance, the transaction reverts.

### The Slashing Pattern

Slashing is a powerful economic mechanism: when a SUSPENDED developer's endorsements are proven bad, the contract sends the staked GEN to the reporter (whistleblower) as a reward. This creates a financial incentive for the community to flag misconduct.

\`\`\`python
@gl.public.write
def slash_endorsement(self, dev: Address) -> None:
    if gl.message.sender_address != self.curator:
        raise gl.vm.UserError("only curator")
    profile = self.developers.get(dev, None)
    if profile is None or profile.status != "SUSPENDED":
        raise gl.vm.UserError("developer must be SUSPENDED")
    stake = self.endorsement_stakes.get(dev, u256(0))
    if stake == 0:
        raise gl.vm.UserError("no stake to slash")
    self.endorsement_stakes[dev] = u256(0)
    gl.send(gl.message.sender_address, stake)
\`\`\`

### Safety Considerations

Always zero out the stake **before** calling \`gl.send\` to prevent re-entrancy: clear the stored value first, then transfer. This is the Checks-Effects-Interactions pattern.

### Your Mission

Implement \`slash_endorsement()\` (curator only, dev must be SUSPENDED) to send the developer's endorsement stake to the caller.

**Key concepts this lesson:** \`gl.send\`, slashing mechanism, Checks-Effects-Interactions.`,
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
        if gl.message.value < 10 ** 16:
            raise gl.vm.UserError("stake too low — minimum 0.01 GEN")
        profile = self.developers.get(dev, None)
        if profile is None:
            raise gl.vm.UserError("developer not found")
        current = self.endorsement_stakes.get(dev, u256(0))
        self.endorsement_stakes[dev] = current + gl.message.value
        profile.endorsements += 1
        self.developers[dev] = profile

    @gl.public.write
    def slash_endorsement(self, dev: Address) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `slash_endorsement()` (curator only, dev must be SUSPENDED): zero out `endorsement_stakes[dev]` then send the previous stake amount to `gl.message.sender_address` using `gl.send`.",
  hints: [
    "Check curator: `if gl.message.sender_address != self.curator: raise gl.vm.UserError('only curator')`.",
    "Check SUSPENDED status and retrieve stake amount: `stake = self.endorsement_stakes.get(dev, u256(0))`.",
    "Follow Checks-Effects-Interactions: `self.endorsement_stakes[dev] = u256(0)` first, then `gl.send(gl.message.sender_address, stake)`.",
  ],
};

export default content;
