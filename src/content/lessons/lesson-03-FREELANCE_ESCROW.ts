import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 3 — Reading Platform Info

### What You'll Learn
Expose platform data using \`@gl.public.view\`. View methods are free to call and return state without modifying it.

### How It Works
\`\`\`python
@gl.public.view
def get_platform_name(self) -> str:
    return self.platform_name
\`\`\`
Add similar methods for description and owner.`,
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
`,
  task: `Add two more \`@gl.public.view\` methods: \`get_platform_description()\` and \`get_owner()\` (return \`self.owner.as_hex\`).`,
  hints: [
    "Add @gl.public.view before each method definition.",
    "get_owner() should return self.owner.as_hex — a string, not an Address object.",
    "Key line: `return self.owner.as_hex`",
  ],
};

export default content;
