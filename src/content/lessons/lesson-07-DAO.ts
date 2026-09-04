import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "DAO",
  explanation: `## Lesson 7 — Adding Members

### What You'll Learn
Let the owner add new members with \`add_member(address_hex: str)\`. Members are stored by hex address.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class GovMind(gl.Contract):
    owner: Address
    dao_name: str
    dao_description: str
    proposal_count: u256
    members: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True

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



    @gl.public.view
    def is_member(self, address: str) -> bool:
        return self.members.get(address, False)
`,
  task: `Add \`add_member(self, address_hex: str)\` with \`@gl.public.write\`. Only owner can add. Set \`self.members[address_hex] = True\`.`,
  hints: [
    "Check sender == self.owner before adding.",
    "Use the passed address_hex string as the key.",
    "Key line: `self.members[address_hex] = True`",
  ],
};

export default content;
