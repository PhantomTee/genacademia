import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 6 — Listing Storage Fields

### What You'll Learn
Add \`listing_count: u256\` — a persistent counter for listing IDs.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class CodeVault(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str
    listing_count: u256

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)

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
  task: `Add \`listing_count: u256\` and initialize to \`u256(0)\`. Add \`get_listing_count()\` as a view returning \`str(self.listing_count)\`.`,
  hints: [
    "Declare listing_count: u256 at class level.",
    "Initialize with u256(0) in __init__.",
    "Key line: `return str(self.listing_count)`",
  ],
};

export default content;
