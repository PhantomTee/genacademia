import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 2 — Write Methods and Caller Identity

In Lesson 1 you built a read-only view. Now it's time to let freelancers **apply** for the job — which means *changing* state. Any method that modifies the contract's storage must be decorated with \`@gl.public.write\`.

### Write Methods

\`\`\`python
@gl.public.write
def apply(self, bio: str) -> None:
    self.applicant_count += 1
\`\`\`

Write methods create blockchain transactions, consume gas, and are recorded on-chain permanently.

### Who Is Calling? — \`gl.message.sender_address\`

GenLayer exposes the caller's wallet address through \`gl.message.sender_address\`. Its type is \`Address\`, a 20-byte value imported from \`genlayer.types\`. Storing this lets TrustLance track **who applied**:

\`\`\`python
from genlayer.types import Address

class FreelanceEscrow(gl.Contract):
    last_applicant: Address
\`\`\`

### Counting Applicants

A simple integer counter (\`applicant_count: int\`) initialised to \`0\` gives the client a quick way to see demand. The getter \`get_applicant_count()\` is a view method that returns that integer.

### What You Will Build

- \`apply(self, bio: str)\`: increments \`applicant_count\` and stores the caller in \`last_applicant\`.
- \`get_applicant_count(self) -> int\`: returns the current count.

These two methods form the foundation of the application registry that grows more sophisticated in later lessons.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address


class FreelanceEscrow(gl.Contract):
    title: str
    applicant_count: int
    last_applicant: Address

    def __init__(self, title: str) -> None:
        self.title = title
        self.applicant_count = 0

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.write
    def apply(self, bio: str) -> None:
        pass  # TODO: increment applicant_count and store sender as last_applicant

    @gl.public.view
    def get_applicant_count(self) -> int:
        pass  # TODO: return the applicant count
`,
  task: "Implement `apply()` to increment `self.applicant_count` and record `gl.message.sender_address` as `self.last_applicant`. Implement `get_applicant_count()` to return the count.",
  hints: [
    "Use `@gl.public.write` for methods that change state. `gl.message.sender_address` returns the caller's `Address`.",
    "Increment with `self.applicant_count += 1` and store the caller with `self.last_applicant = gl.message.sender_address`.",
    "`get_applicant_count` is a view — it simply needs `return self.applicant_count`.",
  ],
};

export default content;
