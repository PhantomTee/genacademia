import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 5 — Capstone: Ownership and Access Control

This first capstone pulls together everything from Lessons 1–4 into a complete job-registration contract. The key new concept is **ownership-gated actions**: only the client who deployed the contract should be able to close applications.

### Ownership Pattern

Compare the caller to the stored owner:

\`\`\`python
@gl.public.write
def close_applications(self) -> None:
    if gl.message.sender_address != self.client:
        raise gl.vm.UserError("only the client can close applications")
    self.is_open = False
\`\`\`

This pattern appears in almost every serious smart contract. It is the on-chain equivalent of an admin permission check.

### Boolean State Flag

\`is_open: bool\` acts as a gate that other methods can check. After the client calls \`close_applications()\`, the contract can optionally reject new \`apply()\` calls (that guard will be added implicitly by checking \`self.is_open\` first).

### Capstone Contract Features

After this lesson TrustLance has:

- A typed \`client: Address\` set at deploy time
- A \`budget: u256\` advertised in the job posting
- Validated \`apply()\` (no blank bios, no duplicates)
- \`close_applications()\` gated to the client only
- \`get_is_open()\` view for the frontend

This is a production-quality registration contract — simple but safe.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    is_open: bool
    applicant_count: int
    last_applicant: Address

    def __init__(self, title: str, budget: u256) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.is_open = True
        self.applicant_count = 0

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.view
    def get_client(self) -> str:
        return str(self.client)

    @gl.public.view
    def get_is_open(self) -> bool:
        pass  # TODO: return self.is_open

    @gl.public.write
    def close_applications(self) -> None:
        pass  # TODO: require caller == client, then set is_open = False

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
  task: "Implement `close_applications()` to raise `gl.vm.UserError` if the caller is not the client, then set `self.is_open = False`. Implement `get_is_open()` to return the boolean flag.",
  hints: [
    "Compare `gl.message.sender_address != self.client` to check for unauthorised callers.",
    "Raise `gl.vm.UserError('only the client can close applications')` before changing any state.",
    "After the ownership check, `self.is_open = False` completes the method. `get_is_open` just returns `self.is_open`.",
  ],
};

export default content;
