import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 5 — CAPSTONE: Complete Identity Contract

This is the first major milestone. You combine everything from Lessons 1–4 into a complete PredictX identity contract: owner tracking, platform metadata, read-only views, and owner-only write access.

### What you have built so far

| Element | Lesson |
|---|---|
| SDK header + \`from genlayer import *\` | 1 |
| \`owner: Address\` stored at deploy time | 2 |
| \`platform_name\` and \`platform_description\` fields | 2 |
| \`@gl.public.view\` methods to expose state | 3 |
| \`@gl.public.write\` with access control + input validation | 4 |

### The new addition: \`get_contract_summary()\`

The only new method this lesson asks you to add is a convenience view that joins the platform name and description into a single readable string. Frontends use this pattern to render a one-line summary without making two separate calls:

\`\`\`python
@gl.public.view
def get_contract_summary(self) -> str:
    return self.platform_name + ": " + self.platform_description
\`\`\`

### What comes next

After this lesson the identity layer of PredictX is complete. The next group of lessons builds market storage on top of it — using \`TreeMap\` to store multiple prediction markets inside one contract.`,
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

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update description"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description
`,
  task: "Add a view method `get_contract_summary(self) -> str` that returns the platform name and description joined by \": \" — for example: \"PredictX: A GenLayer prediction market that uses AI-assisted resolution.\"",
  hints: [
    "Use `@gl.public.view` and return type `str`.",
    "Concatenate with Python's `+` operator: `self.platform_name + \": \" + self.platform_description`.",
    "No imports needed — this is plain string concatenation.",
  ],
};

export default content;
