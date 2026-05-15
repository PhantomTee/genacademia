import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 4 — Typed State: Address and u256

GenLayer contracts run on a blockchain with native types that differ from standard Python. Two of the most important are \`Address\` and \`u256\`.

### Address

\`Address\` represents a 20-byte Ethereum-style account identifier. Use it whenever you store a wallet address or contract address:

\`\`\`python
from genlayer.types import Address

curator: Address

def __init__(self, name: str) -> None:
    self.curator = gl.message.sender_address
\`\`\`

Storing the deployer as the **curator** is the canonical access-control pattern. The curator can later perform privileged operations that ordinary developers cannot.

### u256

\`u256\` is an unsigned 256-bit integer — the native integer type of the EVM. Use it for IDs, token amounts, and any value that must be non-negative and very large:

\`\`\`python
from genlayer.types import u256

registry_id: u256
\`\`\`

Unlike Python's arbitrary-precision \`int\`, \`u256\` wraps at 2²⁵⁶ − 1.

### Exposing Typed Views

Return addresses as strings so any client can read them without special decoding:

\`\`\`python
@gl.public.view
def get_curator(self) -> str:
    return str(self.curator)
\`\`\`

### Your Mission

Add \`curator: Address\` (set to the deployer) and \`registry_id: u256\` (from the constructor), then implement \`get_curator()\`.

**Key concepts this lesson:** \`Address\`, \`u256\`, deployer-as-curator pattern.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    registered: TreeMap[Address, bool]
    curator: Address
    registry_id: u256

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.registered = TreeMap[Address, bool]()
        self.curator = gl.message.sender_address
        self.registry_id = registry_id

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.view
    def get_curator(self) -> str:
        pass

    @gl.public.write
    def register(self, handle: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.registered.get(gl.message.sender_address, False):
            raise gl.vm.UserError("already registered")
        self.registered[gl.message.sender_address] = True
        self.developer_count += 1

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `get_curator()` to return the curator's address as a string.",
  hints: [
    "The curator address is stored in `self.curator` as an `Address` type.",
    "Convert it to a plain string for the return value using `str(self.curator)`.",
    "The complete body is a single line: `return str(self.curator)`.",
  ],
};

export default content;
