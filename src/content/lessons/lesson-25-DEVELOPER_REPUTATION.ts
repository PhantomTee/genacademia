import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 25,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 25 — Capstone: Stakes and Reward Claiming

Developers who earn high scores and get verified deserve a share of the endorsement pool. This capstone implements \`claim_endorsement_reward\` — a proportional payout mechanism that ties together staking, scoring, and verification.

### Proportional Rewards

A verified developer's share is proportional to their score relative to the total pool. The simplest formula:

\`\`\`python
# Share = score / max_possible_score * pool_fraction
share = (profile.score * total_pool) // 100
\`\`\`

A score-100 developer claims 100% of their proportional slice; a score-50 developer claims half.

### Time-Based Eligibility

Claims should only be allowed after a cooldown period to prevent immediate draining. Track claim time with an \`int\` timestamp:

\`\`\`python
last_claim: TreeMap[Address, int]

# 30-day cooldown in seconds
CLAIM_COOLDOWN = 30 * 24 * 60 * 60
\`\`\`

For simplicity in this lesson, use \`developer_count\` as a proxy for "enough time has passed" (or implement a block-number check).

### Sending the Reward

Use \`gl.send\` to pay out the verified developer:

\`\`\`python
gl.send(gl.message.sender_address, share)
self.total_endorsement_pool -= share
\`\`\`

### Capstone Checklist

- Caller must be VERIFIED
- Pool must have funds
- Share calculation is fair and proportional to score
- Pool balance decremented correctly
- Reward sent to the claiming developer

**Key concepts this lesson:** reward distribution, proportional payouts, Checks-Effects-Interactions.`,
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

    @gl.public.write.payable
    def endorse(self, dev: Address) -> None:
        if gl.message.value < 10 ** 16:
            raise gl.vm.UserError("stake too low — minimum 0.01 GEN")
        profile = self.developers.get(dev, None)
        if profile is None:
            raise gl.vm.UserError("developer not found")
        current = self.endorsement_stakes.get(dev, u256(0))
        self.endorsement_stakes[dev] = current + gl.message.value
        self.total_endorsement_pool += gl.message.value
        profile.endorsements += 1
        self.developers[dev] = profile

    @gl.public.write
    def claim_endorsement_reward(self) -> None:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `claim_endorsement_reward()`: check the caller is a VERIFIED developer with score > 0, calculate their proportional share of `total_endorsement_pool` based on score, deduct from the pool, and send the share to the caller.",
  hints: [
    "Retrieve caller's profile and check `profile.status == 'VERIFIED'` and `profile.score > 0`, else raise `UserError`.",
    "Calculate share: `share = u256((profile.score * int(self.total_endorsement_pool)) // 100)` — check `share > 0`.",
    "Follow Checks-Effects-Interactions: decrement `self.total_endorsement_pool -= share` before calling `gl.send(gl.message.sender_address, share)`.",
  ],
};

export default content;
