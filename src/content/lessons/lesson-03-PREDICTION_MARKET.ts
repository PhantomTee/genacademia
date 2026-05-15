import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 3 — \`@gl.public.view\`: Read-Only State Exposure

\`@gl.public.view\` marks a method as read-only. View methods can read contract state but must not modify it. They are how frontends display public information — and they cost **no gas** for the caller.

\`\`\`python
@gl.public.view
def get_platform_name(self) -> str:
    return self.platform_name
\`\`\`

The starter code already has \`get_platform_name()\` implemented. Your job is to add two more view methods following the same pattern.

### Returning an Address as a string

The \`owner\` field has type \`Address\`. To return it as a readable hex string, use the \`.as_hex\` property:

\`\`\`python
@gl.public.view
def get_owner(self) -> str:
    return self.owner.as_hex
\`\`\`

\`.as_hex\` converts the on-chain \`Address\` type into a standard \`0x...\` hex string that any frontend can display or compare. The return type annotation is \`str\` because \`.as_hex\` produces a plain string.

### Rules for view methods

- Decorate with \`@gl.public.view\` — without it, the method is not callable externally.
- Return type must match — annotate accurately so callers and tooling know what to expect.
- Never assign to \`self.*\` — the runtime will reject state changes inside a view.`,
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
`,
  task: "Add two new view methods: `get_platform_description()` that returns `self.platform_description`, and `get_owner()` that returns the owner address as a hex string using `self.owner.as_hex`.",
  hints: [
    "Model both new methods on the existing `get_platform_name()` — same decorator, same pattern.",
    "`get_owner()` should have return type `str` and return `self.owner.as_hex` (the Address type has an `.as_hex` property).",
    "Both methods need `@gl.public.view` above the `def` line and a `return` statement.",
  ],
};

export default content;
