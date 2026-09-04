import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "DAO",
  explanation: `## Lesson 20 — Major Upgrade: Full Governance Voting Flow

### What You'll Learn
Ship the complete propose → vote → execute GovMind governance system.`,
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
    for_votes: TreeMap[str, u256]
    against_votes: TreeMap[str, u256]
    has_voted: TreeMap[str, bool]

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


    @gl.public.write
    def vote(self, proposal_id: str, support: bool) -> None:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        voter_key = proposal_id + "_" + gl.message.sender_address.as_hex
        assert not self.has_voted.get(voter_key, False), "Already voted"
        assert self.members.get(gl.message.sender_address.as_hex, False), "Only members can vote"
        assert self.proposal_statuses[proposal_id] == "open", "Proposal must be open"
        self.has_voted[voter_key] = True
        if support:
            self.for_votes[proposal_id] = self.for_votes.get(proposal_id, u256(0)) + u256(1)
        else:
            self.against_votes[proposal_id] = self.against_votes.get(proposal_id, u256(0)) + u256(1)

    @gl.public.write
    def execute_proposal(self, proposal_id: str) -> None:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        assert self.proposal_statuses[proposal_id] == "open", "Proposal must be open"
        assert gl.message.sender_address == self.owner, "Only owner can execute"
        fv = self.for_votes.get(proposal_id, u256(0))
        av = self.against_votes.get(proposal_id, u256(0))
        if fv > av:
            self.proposal_statuses[proposal_id] = "passed"
        else:
            self.proposal_statuses[proposal_id] = "rejected"
`,
  task: `Add \`get_member_count(self) -> str\` as a \`@gl.public.view\`. Since TreeMap doesn't have .len(), keep a \`member_count: u256\` counter and increment it in \`add_member()\`.`,
  hints: [
    "Add member_count: u256 at class level, initialize to u256(1) for the owner.",
    "Increment on add_member, return str(self.member_count).",
    "Key line: `self.member_count = self.member_count + u256(1)`",
  ],
};

export default content;
