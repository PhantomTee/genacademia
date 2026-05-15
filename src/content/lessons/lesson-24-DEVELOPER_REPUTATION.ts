import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 24,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 24 — Contract-to-Contract Calls

CodeVault doesn't exist in isolation. Other on-chain contracts — like a badge system — can enrich developer profiles. \`gl.call_contract\` lets you call methods on other deployed contracts and use their return values.

### Basic Usage

\`\`\`python
result = gl.call_contract(contract_address, method_name, [arg1, arg2])
\`\`\`

- \`contract_address\` — an \`Address\`
- \`method_name\` — a \`str\`
- Third argument — a \`list\` of arguments passed to the method

### Fetching Badge Count

Suppose a badge contract exposes \`count_badges(dev: Address) -> int\`. You can query it from CodeVault:

\`\`\`python
badge_contract: Address

@gl.public.view
def get_badge_count(self, dev: Address) -> int:
    result = gl.call_contract(self.badge_contract, "count_badges", [dev])
    return int(result)
\`\`\`

### Handling the Return Value

\`gl.call_contract\` returns the raw encoded result. Cast it explicitly to the expected type — here \`int\` — to avoid type errors downstream.

### Why Cross-Contract Calls?

They allow a **composable ecosystem**: CodeVault can integrate with a badge contract, a bounty contract, or a DAO voting contract — each specialised but interoperable. This is the power of on-chain composability.

### Your Mission

Implement \`get_badge_count(dev)\` to call \`self.badge_contract\` with method \`"count_badges"\` and the developer address, returning the result as an integer.

**Key concepts this lesson:** \`gl.call_contract\`, cross-contract composability, return type casting.`,
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
    badge_contract: Address

    def __init__(self, name: str, registry_id: u256, badge_contract: Address) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()
        self.endorsement_stakes = TreeMap[Address, u256]()
        self.badge_contract = badge_contract

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

    @gl.public.view
    def get_badge_count(self, dev: Address) -> int:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `get_badge_count(dev)` to call `self.badge_contract` with method `'count_badges'` and `[dev]` as arguments, returning the result cast to `int`.",
  hints: [
    "Use `result = gl.call_contract(self.badge_contract, 'count_badges', [dev])` to call the external contract.",
    "The result is the raw return value from the external method — cast it explicitly: `return int(result)`.",
    "This is a `@gl.public.view` — it reads external state but doesn't modify CodeVault's own state.",
  ],
};

export default content;
