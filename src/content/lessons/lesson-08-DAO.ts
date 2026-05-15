import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 8,
  projectPath: "DAO",
  explanation: `## Lesson 8 — Voting Power with u256

### What You'll Learn
Track per-member voting power as \`u256\`. Default power is 1; the owner can grant more weight to key members.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class GovMind(gl.Contract):
    owner: Address
    dao_name: str
    dao_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."

    @gl.public.view
    def get_dao_name(self) -> str:
        return self.dao_name

    @gl.public.view
    def get_dao_description(self) -> str:
        return self.dao_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.dao_name + ": " + self.dao_description

    @gl.public.write
    def update_dao_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.dao_description = new_description

    proposal_count: u256
    members: TreeMap[str, bool]
    voting_power: TreeMap[str, u256]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True
        self.voting_power[self.owner.as_hex] = u256(1)
`,
  task: `Add \`voting_power: TreeMap[str, u256]\` at class level. Give the owner \`u256(1)\` in \`__init__\`. Add \`set_voting_power(self, address_hex: str, power: u256)\` (owner only).`,
  hints: [
    "Initialize owner's voting power in __init__.",
    "Only owner can call set_voting_power.",
    "Key line: `self.voting_power[address_hex] = power`",
  ],
};

export default content;
