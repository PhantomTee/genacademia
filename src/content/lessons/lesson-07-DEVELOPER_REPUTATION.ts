import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 7 — Seller Address Tracking

### What You'll Learn
Store the seller's wallet address in a \`TreeMap[str, Address]\` keyed by listing ID.`,
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

    listing_count: u256
    listing_sellers: TreeMap[str, Address]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)
`,
  task: `Add a stub \`create_listing_stub(self, title: str) -> str\` that stores the caller in \`listing_sellers[str(self.listing_count)]\` and increments.`,
  hints: [
    "Use gl.message.sender_address to capture the seller.",
    "Increment: self.listing_count = self.listing_count + u256(1).",
    "Key line: `self.listing_sellers[listing_id] = gl.message.sender_address`",
  ],
};

export default content;
