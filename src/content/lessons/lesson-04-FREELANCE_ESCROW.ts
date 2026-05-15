import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 4 — Updating Platform Info

### What You'll Learn
Use \`@gl.public.write\` to modify state. Only the owner should be able to update the description.

### How It Works
\`\`\`python
@gl.public.write
def update_platform_description(self, new_description: str) -> None:
    assert gl.message.sender_address == self.owner, "Only owner can update"
\`\`\`
The \`assert\` guard rejects unauthorized callers.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class TrustLance(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."

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
  task: `Add \`update_platform_description(self, new_description: str)\` decorated with \`@gl.public.write\`. Validate that only the owner can call it, and that the description is not empty.`,
  hints: [
    "Use @gl.public.write and check gl.message.sender_address == self.owner.",
    "Add a second assert to reject empty descriptions.",
    "Key line: `assert len(new_description) > 0, 'Description cannot be empty'`",
  ],
};

export default content;
