import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 4 — Updating Marketplace Settings

### What You'll Learn
Add an owner-only \`update_platform_description()\` method using \`@gl.public.write\`.`,
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

    @gl.public.view
    def get_platform_name(self) -> str: return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str: return self.platform_description

    @gl.public.view
    def get_owner(self) -> str: return self.owner.as_hex
`,
  task: `Add \`update_platform_description(self, new_description: str)\` with \`@gl.public.write\`. Validate owner access and non-empty description.`,
  hints: [
    "Assert sender == self.owner first.",
    "Then assert len(new_description) > 0.",
    "Key line: `assert gl.message.sender_address == self.owner, 'Only owner can update'`",
  ],
};

export default content;
