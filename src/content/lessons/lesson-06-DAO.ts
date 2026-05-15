import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "DAO",
  explanation: `## Lesson 6 — Member Storage

### What You'll Learn
Add \`members: TreeMap[str, bool]\` to track DAO membership. Only members can create proposals and vote.`,
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

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True
`,
  task: `Automatically add the deployer as the first member in \`__init__\` using \`self.members[self.owner.as_hex] = True\`. Add \`is_member(self, address: str) -> bool\` as a view.`,
  hints: [
    "Set self.members[self.owner.as_hex] = True in __init__.",
    "Return self.members.get(address, False) in is_member.",
    "Key line: `self.members[self.owner.as_hex] = True`",
  ],
};

export default content;
