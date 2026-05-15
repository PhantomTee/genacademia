import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 5 — Major Upgrade: Marketplace Identity Contract

### What You'll Learn
Combine all Group 1 concepts: owner, metadata, views, write, summary.`,
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

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.platform_name + ": " + self.platform_description

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description
`,
  task: `Add \`get_contract_summary(self) -> str\` returning the platform name and description joined with ": ".`,
  hints: [
    "Concatenate platform_name and platform_description.",
    "No extra formatting needed.",
    "Key line: `return self.platform_name + ': ' + self.platform_description`",
  ],
};

export default content;
