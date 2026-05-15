import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "INSURANCE",
  explanation: `## Lesson 4 — Address & u256 Types

GenLayer contracts work with two important primitive types that have no direct Python equivalent: \`Address\` and \`u256\`.

### Address

\`Address\` represents a 20-byte Ethereum-style wallet or contract identifier. It is used to:

- Track ownership (who is the insurer?)
- Identify policyholders
- Send funds to a specific recipient

Import it from \`genlayer.types\`:

\`\`\`python
from genlayer.types import Address
\`\`\`

Capture the deployer's address at construction time:

\`\`\`python
insurer: Address

def __init__(self, name: str, pool_id: u256) -> None:
    self.insurer = gl.message.sender_address
\`\`\`

### u256

\`u256\` is an unsigned 256-bit integer — the native numeric type of the EVM. Use it for:

- Token amounts (wei)
- Pool IDs
- Coverage amounts

\`\`\`python
from genlayer.types import u256

pool_id: u256

def __init__(self, name: str, pool_id: u256) -> None:
    self.pool_id = pool_id
\`\`\`

### Exposing the Insurer

Adding a view for the insurer lets external callers (including other contracts) verify who controls the pool:

\`\`\`python
@gl.public.view
def get_insurer(self) -> str:
    return str(self.insurer)
\`\`\`

We return it as \`str\` because \`Address\` serialises cleanly to a hex string, which is easy to display in front-ends.

### Key Takeaways

- \`Address\` stores wallet/contract identifiers.
- \`u256\` is the large-integer type for financial values.
- Capture the deployer with \`gl.message.sender_address\` inside \`__init__\`.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256

class InsurancePool(gl.Contract):
    pool_name: str
    holder_count: int
    insurer: Address
    pool_id: u256

    def __init__(self, name: str, pool_id: u256) -> None:
        self.pool_name = name
        self.holder_count = 0
        self.pool_id = pool_id
        # TODO: set self.insurer to the deployer address

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.view
    def get_insurer(self) -> str:
        pass

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        if len(flight_number) < 5:
            raise gl.vm.UserError("invalid flight number")
        self.holder_count += 1

    @gl.public.view
    def get_holder_count(self) -> int:
        return self.holder_count`,
  task: "Set `self.insurer = gl.message.sender_address` in `__init__`, and implement `get_insurer()` to return the insurer address as a string.",
  hints: [
    "In `__init__`, capture who deployed the contract: `self.insurer = gl.message.sender_address`.",
    "`get_insurer` is a view method — it just needs to return the stored address.",
    "Convert the Address to a string: `return str(self.insurer)`.",
  ],
};

export default content;
