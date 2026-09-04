import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 8,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 8 — Listing Price with u256

### What You'll Learn
Store listing price as \`u256\`. All on-chain monetary amounts must use fixed-width integers.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class CodeVault(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str
    listing_count: u256
    listing_sellers: TreeMap[str, Address]
    listing_prices: TreeMap[str, u256]

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
  task: `Add \`listing_prices: TreeMap[str, u256]\`. Update \`create_listing\` so it also accepts \`price: u256\` and stores it in \`listing_prices[listing_id]\`.`,
  hints: [
    "Declare listing_prices: TreeMap[str, u256] at class level.",
    "Store price: self.listing_prices[listing_id] = price.",
    "Key line: `self.listing_prices[listing_id] = price`",
  ],
};

export default content;
