import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 4 — \`@gl.public.write\`: State Mutation with Access Control

\`@gl.public.write\` marks a method that modifies contract state. Unlike view calls, write calls create a transaction on-chain and require validator consensus. They cost gas.

\`\`\`python
@gl.public.write
def update_platform_description(self, new_description: str) -> None:
    self.platform_description = new_description
\`\`\`

### Access control with \`assert\`

Anyone on the blockchain can call a public write method unless you add a guard. The standard pattern uses \`assert\` to check the caller's identity:

\`\`\`python
assert gl.message.sender_address == self.owner, "Only owner can update description"
\`\`\`

If the assertion fails, the entire transaction reverts — no state changes are applied and the error message is returned to the caller.

### Validating inputs

Use \`assert\` for input validation too. Check that strings are non-empty before storing them:

\`\`\`python
assert len(new_description) > 0, "Description cannot be empty"
\`\`\`

Always place all assertions **before** any state modifications. This way, if any check fails, nothing gets written to the chain — a clean all-or-nothing pattern.

### Order matters

1. Assert caller is authorised.
2. Assert inputs are valid.
3. Modify state.

This ordering is a smart-contract best practice: validate completely before touching storage.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex
`,
  task: "Add a write method `update_platform_description(self, new_description: str) -> None` that: (1) asserts the caller is the owner, (2) asserts the new description is not empty, then (3) updates `self.platform_description`.",
  hints: [
    "Use `@gl.public.write` (not `@gl.public.view`) since this method changes state.",
    "The ownership check is: `assert gl.message.sender_address == self.owner, \"Only owner can update description\"`",
    "The empty-string check is: `assert len(new_description) > 0, \"Description cannot be empty\"`",
  ],
};

export default content;
