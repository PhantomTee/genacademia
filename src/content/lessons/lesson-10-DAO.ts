import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 10,
  projectPath: "DAO",
  explanation: `## Lesson 10 — Major Upgrade: Create Proposals

### What You'll Learn
Build the complete \`create_proposal()\` method with member-only access, full validation, and TreeMap record creation.`,
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
    proposal_titles: TreeMap[str, str]
    proposal_descriptions: TreeMap[str, str]
    proposal_proposers: TreeMap[str, Address]
    proposal_statuses: TreeMap[str, str]
    members: TreeMap[str, bool]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.dao_name = "GovMind"
        self.dao_description = "An AI-governed decentralised autonomous organisation."
        self.proposal_count = u256(0)
        self.members[self.owner.as_hex] = True
`,
  task: `Complete \`create_proposal\` with: member check, non-empty title check, non-empty description check, all field assignments, counter increment, return proposal_id.`,
  hints: [
    "Members are stored by address hex — check self.members.get(sender.as_hex, False).",
    "Return the proposal_id string after incrementing the counter.",
    "Key line: `assert self.members.get(gl.message.sender_address.as_hex, False), 'Only members can propose'`",
  ],
};

export default content;
