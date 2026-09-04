import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 2 — CodeVault Contract Skeleton

### What You'll Learn
Add owner tracking and platform metadata fields for CodeVault.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class CodeVault(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."

`,
  task: `Add \`platform_description: str\` and initialize it with "A GenLayer private code marketplace."`,
  hints: [
    "Declare platform_description: str at class level.",
    "Initialize it in __init__ after platform_name.",
    "Key line: `self.platform_description = 'A GenLayer private code marketplace.'`",
  ],
};

export default content;
