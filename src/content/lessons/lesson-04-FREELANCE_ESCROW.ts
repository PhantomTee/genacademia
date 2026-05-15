import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 4 — Address and u256 Types

GenLayer contracts handle money, so type safety is critical. This lesson introduces two key types from \`genlayer.types\`:

### \`Address\`

An \`Address\` is a 20-byte Ethereum-compatible identifier representing a wallet or contract. Use it for any field that stores "who":

\`\`\`python
from genlayer.types import Address

class FreelanceEscrow(gl.Contract):
    client: Address
\`\`\`

In the constructor, \`gl.message.sender_address\` is of type \`Address\`, so you can assign it directly:

\`\`\`python
def __init__(self, title: str, budget: int) -> None:
    self.client = gl.message.sender_address
\`\`\`

The person who deploys TrustLance becomes the *client* — the party that posts the job and ultimately releases funds.

### \`u256\`

\`u256\` is an unsigned 256-bit integer — the native currency denomination on GenLayer (wei). Always use \`u256\` for token amounts to avoid overflow and to signal intent:

\`\`\`python
from genlayer.types import u256

class FreelanceEscrow(gl.Contract):
    budget: u256
\`\`\`

Pass the budget in the constructor so the job posting advertises the payout upfront.

### Why These Types Matter

Using the correct types catches mistakes at the GenLayer VM level before they become on-chain bugs. Mixing plain \`int\` for addresses or amounts can lead to silent truncation — typed state variables are safer and more readable.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    applicant_count: int
    last_applicant: Address

    def __init__(self, title: str, budget: u256) -> None:
        # TODO: set self.client to the deployer's address
        # TODO: set self.budget from the constructor argument
        self.title = title
        self.applicant_count = 0

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.view
    def get_client(self) -> str:
        pass  # TODO: return self.client as a string

    @gl.public.write
    def apply(self, bio: str) -> None:
        if not bio:
            raise gl.vm.UserError("bio required")
        if self.last_applicant == gl.message.sender_address:
            raise gl.vm.UserError("already applied")
        self.applicant_count += 1
        self.last_applicant = gl.message.sender_address

    @gl.public.view
    def get_applicant_count(self) -> int:
        return self.applicant_count
`,
  task: "In `__init__`, set `self.client = gl.message.sender_address` and `self.budget = budget`. Implement `get_client()` to return the client address as a string.",
  hints: [
    "`gl.message.sender_address` is the deploying wallet — assign it to `self.client`.",
    "The `budget` parameter is already typed `u256`; assign directly: `self.budget = budget`.",
    "`get_client` can return `str(self.client)` to convert the Address to a readable hex string.",
  ],
};

export default content;
