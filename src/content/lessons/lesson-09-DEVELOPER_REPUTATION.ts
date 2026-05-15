import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 9 — Private Source Metadata

### What You'll Learn
Store source code hash (off-chain reference) and a public preview separately. The hash stays private until purchase is confirmed.`,
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
    listing_titles: TreeMap[str, str]
    listing_descriptions: TreeMap[str, str]
    listing_sellers: TreeMap[str, Address]
    listing_prices: TreeMap[str, u256]
    listing_statuses: TreeMap[str, str]
    listing_source_hashes: TreeMap[str, str]
    listing_previews: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "CodeVault"
        self.platform_description = "A GenLayer private code marketplace."
        self.listing_count = u256(0)
`,
  task: `Add all 8 listing fields at class level. Update the stub to store title, description, source_hash, preview, and status ("active").`,
  hints: [
    "Declare all 8 fields at class level.",
    "Set listing_statuses[listing_id] = 'active'.",
    "Key line: `self.listing_source_hashes[listing_id] = source_hash`",
  ],
};

export default content;
