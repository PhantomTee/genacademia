import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 3 — Marketplace Info View

### What You'll Learn
Expose marketplace metadata with \`@gl.public.view\` methods for the frontend to consume.`,
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
    def get_platform_name(self) -> str:
        return self.platform_name
`,
  task: `Add \`get_platform_description()\` and \`get_owner()\` as \`@gl.public.view\` methods. get_owner() returns \`self.owner.as_hex\`.`,
  hints: [
    "Both methods need @gl.public.view.",
    "get_owner returns self.owner.as_hex.",
    "Key line: `return self.owner.as_hex`",
  ],
};

export default content;
