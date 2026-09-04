import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 2 — TrustLance Contract Skeleton

### What You'll Learn
Add persistent owner tracking and a platform name field. The owner will have admin rights for the platform.

### How It Works
\`gl.message.sender_address\` captures the deployer:
\`\`\`python
self.owner = gl.message.sender_address
\`\`\`
Declare \`owner: Address\` at class level to persist it across calls.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class TrustLance(gl.Contract):
    owner: Address
    platform_name: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"

`,
  task: `Add a \`platform_description: str\` field and initialize it in the constructor with "A GenLayer freelance escrow platform."`,
  hints: [
    "Add the field at class level and assign it in __init__.",
    "Use the exact string: A GenLayer freelance escrow platform.",
    "Key line: `self.platform_description = 'A GenLayer freelance escrow platform.'`",
  ],
};

export default content;
