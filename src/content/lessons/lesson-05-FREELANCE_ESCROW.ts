import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 5 — Major Upgrade: Freelance Platform Identity Contract

### What You'll Learn
Combine everything from lessons 1-4 into a complete identity contract: owner, platform metadata, view methods, write methods, and a summary getter.

### How It Works
A capstone lesson assembles all concepts learned so far. Add \`get_contract_summary()\` to combine name and description in one call.`,
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

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.platform_description = new_description
`,
  task: `Add \`get_contract_summary(self) -> str\` that returns the platform name and description joined with ": ".`,
  hints: [
    "Concatenate platform_name and platform_description with a separator.",
    "Use the + operator to join strings.",
    "Key line: `return self.platform_name + ': ' + self.platform_description`",
  ],
};

export default content;
