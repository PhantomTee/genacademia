import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "DAO",
  explanation: `## Lesson 12 — Proposal JSON View

### What You'll Learn
Build \`get_proposal_json(proposal_id)\` so the frontend can read proposal details as a JSON string.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class GovMind(gl.Contract):
    owner: Address
    dao_name: str
    dao_description: str
    proposal_count: u256
    proposal_titles: TreeMap[str, str]
    proposal_descriptions: TreeMap[str, str]
    proposal_proposers: TreeMap[str, Address]
    proposal_statuses: TreeMap[str, str]
    members: TreeMap[str, bool]
    proposal_ids: DynArray[str]

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



    @gl.public.write
    def create_proposal(self, title: str, description: str) -> str:
        assert self.members.get(gl.message.sender_address.as_hex, False), "Only members can propose"
        assert len(title) > 0, "Title cannot be empty"
        assert len(description) > 0, "Description cannot be empty"
        proposal_id = str(self.proposal_count)
        self.proposal_titles[proposal_id] = title
        self.proposal_descriptions[proposal_id] = description
        self.proposal_proposers[proposal_id] = gl.message.sender_address
        self.proposal_statuses[proposal_id] = "open"
        self.proposal_count = self.proposal_count + u256(1)
        return proposal_id

`,
  task: `Add \`get_proposal_json(self, proposal_id: str) -> str\` with \`@gl.public.view\`. Assert proposal exists, return \`json.dumps({...}, sort_keys=True)\` with id, title, description, proposer (as hex), status.`,
  hints: [
    "Assert proposal_id in self.proposal_titles first.",
    "Use json.dumps and sort_keys=True.",
    "Key line: `'proposer': self.proposal_proposers[proposal_id].as_hex`",
  ],
};

export default content;
