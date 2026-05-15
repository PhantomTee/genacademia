import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 26,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 26 — Randomness: Developer of the Month

CodeVault wants to spotlight outstanding developers with a monthly recognition. Rather than curator bias, the selection should be **verifiably random** — unpredictable but fair. \`gl.get_random_u8()\` provides on-chain randomness via the consensus protocol.

### gl.get_random_u8

\`\`\`python
rand = gl.get_random_u8()  # Returns int in [0, 255]
\`\`\`

This is consensus-safe randomness derived from the block's entropy. It's uniform over 0–255.

### Selecting from a List

To pick one element from a \`DynArray\` of top developers:

\`\`\`python
idx = gl.get_random_u8() % len(self.top_developers)
winner = self.top_developers[idx]
\`\`\`

The modulo operation maps the 0–255 range onto the array indices. For arrays longer than 256, use a combination of multiple random bytes.

### DynArray

\`DynArray\` is GenLayer's dynamic array — think Python list but persistent on-chain:

\`\`\`python
from genlayer.types import DynArray

top_developers: DynArray[Address]

self.top_developers = DynArray[Address]()
self.top_developers.append(some_address)
arr_len = len(self.top_developers)
element = self.top_developers[0]
\`\`\`

### Your Mission

Implement \`select_dev_of_month()\` to randomly pick an address from \`self.top_developers\` using \`gl.get_random_u8()\`. Raise a \`UserError\` if the array is empty.

**Key concepts this lesson:** \`gl.get_random_u8()\`, \`DynArray\`, modulo-based random selection.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap, DynArray
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
    top_developers: DynArray[Address]

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()
        self.endorsement_stakes = TreeMap[Address, u256]()
        self.total_endorsement_pool = u256(0)
        self.top_developers = DynArray[Address]()

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

    @gl.public.write
    def add_top_developer(self, dev: Address) -> None:
        if gl.message.sender_address != self.curator:
            raise gl.vm.UserError("only curator")
        self.top_developers.append(dev)

    @gl.public.write
    def select_dev_of_month(self) -> Address:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `select_dev_of_month()` to raise a `UserError` if `top_developers` is empty, then use `gl.get_random_u8()` to pick a random index and return the corresponding `Address` from `self.top_developers`.",
  hints: [
    "Check `if len(self.top_developers) == 0: raise gl.vm.UserError('no top developers')` first.",
    "Generate a random index: `idx = gl.get_random_u8() % len(self.top_developers)`.",
    "Return the element: `return self.top_developers[idx]`.",
  ],
};

export default content;
