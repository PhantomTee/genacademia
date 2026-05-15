import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 3 — Input Validation with UserError

Accepting any input without checking it is a classic smart-contract bug. TrustLance needs two guards in \`apply()\`:

1. **Non-empty bio** — a blank bio gives the client nothing useful to read.
2. **No duplicate applications** — a freelancer who already applied shouldn't be able to spam the counter.

### Raising Errors in GenLayer

Use \`gl.vm.UserError\` to signal invalid input. This exception is surfaced to the caller as a readable message and rolls back any state changes made so far in the transaction:

\`\`\`python
if not bio:
    raise gl.vm.UserError("bio required")
\`\`\`

Unlike a plain Python exception, \`UserError\` is the correct way to communicate business-rule violations to end users.

### Duplicate Detection

At this stage we only track the *most recent* applicant in \`self.last_applicant\`. We can use that for a lightweight duplicate check — if the caller is already stored there, they have applied before:

\`\`\`python
if self.last_applicant == gl.message.sender_address:
    raise gl.vm.UserError("already applied")
\`\`\`

This is intentionally simple; Lesson 11 upgrades to a full \`TreeMap\` that tracks *all* applicants.

### Order Matters

Always validate **before** modifying state. If a check fails after some state has been updated, you need to manually undo it — error-first design avoids that complexity entirely.`,
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
        # TODO: raise gl.vm.UserError if bio is empty
        # TODO: raise gl.vm.UserError if caller == self.last_applicant
        self.applicant_count += 1
        self.last_applicant = gl.message.sender_address

    @gl.public.view
    def get_applicant_count(self) -> int:
        return self.applicant_count
`,
  task: "Add two validation checks to `apply()`: raise `gl.vm.UserError` if `bio` is empty, and raise `gl.vm.UserError` if the caller is already stored as `self.last_applicant`.",
  hints: [
    "Check inputs at the very top of the method, before changing any state.",
    "`if not bio: raise gl.vm.UserError('bio required')` handles the empty-bio case.",
    "`if self.last_applicant == gl.message.sender_address: raise gl.vm.UserError('already applied')` prevents duplicate submissions.",
  ],
};

export default content;
