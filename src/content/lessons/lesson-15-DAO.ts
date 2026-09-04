import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "DAO",
  explanation: `## Lesson 15 — Major Upgrade: Browseable DAO Governance Board

### What You'll Learn
Combine proposal indexing, JSON views, status filtering, and status transitions into a full dashboard contract.`,
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


    @gl.public.view
    def get_proposal_json(self, proposal_id: str) -> str:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        return json.dumps({
            "id": proposal_id,
            "title": self.proposal_titles[proposal_id],
            "description": self.proposal_descriptions[proposal_id],
            "proposer": self.proposal_proposers[proposal_id].as_hex,
            "status": self.proposal_statuses[proposal_id],
        }, sort_keys=True)

    @gl.public.view
    def get_open_proposals_json(self) -> str:
        result = []
        for pid in self.proposal_ids:
            if self.proposal_statuses[pid] == "open":
                result.append({"id": pid, "title": self.proposal_titles[pid]})
        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_proposals_json(self) -> str:
        result = []
        for pid in self.proposal_ids:
            result.append({"id": pid, "title": self.proposal_titles[pid], "status": self.proposal_statuses[pid]})
        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def close_proposal(self, proposal_id: str) -> None:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        assert gl.message.sender_address == self.owner, "Only owner can close"
        assert self.proposal_statuses[proposal_id] == "open", "Only open proposals can be closed"
        self.proposal_statuses[proposal_id] = "closed"
`,
  task: `Add \`get_all_proposals_json()\` that returns all proposals (any status) with id, title, status.`,
  hints: [
    "Loop proposal_ids without any status filter.",
    "Include 'status' in each entry.",
    "Key line: `result.append({'id': pid, 'title': ..., 'status': ...})`",
  ],
};

export default content;
