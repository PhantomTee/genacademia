import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "INSURANCE",
  explanation: `## Lesson 3 — Input Validation & UserErrors

A smart contract that accepts any input is a security risk. In this lesson you learn how to **validate inputs** and signal problems to callers using \`gl.vm.UserError\`.

### Why Validate?

Flight numbers follow a strict format: two letters followed by 1–4 digits (e.g. \`AA1234\`, \`LH998\`). Accepting garbage data would pollute state and make downstream AI verification unreliable.

There are two layers of validation for \`enroll()\`:

1. **Format check** — flight number must be at least 5 characters.
2. **Duplicate check** — the same address should not enroll twice.

### gl.vm.UserError

\`gl.vm.UserError\` is the standard way to signal a caller mistake. It reverts the transaction and returns the message to the caller without consuming all gas:

\`\`\`python
if len(flight_number) < 5:
    raise gl.vm.UserError("invalid flight number")
\`\`\`

### Validating Before State Changes

Always validate **before** mutating state. This is a fundamental pattern called *checks-effects-interactions*:

\`\`\`python
@gl.public.write
def enroll(self, flight_number: str) -> None:
    # 1. Checks
    if len(flight_number) < 5:
        raise gl.vm.UserError("invalid flight number")
    # 2. Effects (state changes)
    self.holder_count += 1
\`\`\`

### Duplicate Enrollment

To prevent double-enrollment you need to track which addresses have already enrolled. You will add full mapping-based tracking in Lesson 11. For now, the lesson focuses on the flight number format check.

### Key Takeaways

- Use \`raise gl.vm.UserError("message")\` for invalid user input.
- Always perform checks before modifying state.
- Validation protects data integrity and downstream AI accuracy.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl

class InsurancePool(gl.Contract):
    pool_name: str
    holder_count: int

    def __init__(self, name: str) -> None:
        self.pool_name = name
        self.holder_count = 0

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        # TODO: validate flight_number length >= 5
        pass

    @gl.public.view
    def get_holder_count(self) -> int:
        return self.holder_count`,
  task: "Add validation to `enroll()`: raise `gl.vm.UserError` if `flight_number` is empty or has fewer than 5 characters, then increment `holder_count` if valid.",
  hints: [
    "Check the input before touching state. Use an `if` statement at the top of `enroll()`.",
    "The condition is `if len(flight_number) < 5:` — raise `gl.vm.UserError(\"invalid flight number\")` inside the `if` block.",
    "After the check passes, add `self.holder_count += 1` to complete the enrollment.",
  ],
};

export default content;
