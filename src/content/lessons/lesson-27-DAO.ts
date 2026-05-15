import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 27,
  projectPath: "DAO",
  explanation: `## Lesson 27 — Frontend Integration for Governance

### What You'll Learn
Which methods a governance UI should call. Add a JSON method mapping actions to contract methods.`,
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

    proposal_ids: DynArray[str]

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

    for_votes: TreeMap[str, u256]
    against_votes: TreeMap[str, u256]
    has_voted: TreeMap[str, bool]

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

    proposal_ai_summaries: TreeMap[str, str]

    @gl.public.write
    def analyze_proposal_with_ai(self, proposal_id: str) -> str:
        assert proposal_id in self.proposal_titles, "Proposal not found"
        title = self.proposal_titles[proposal_id]
        description = self.proposal_descriptions[proposal_id]
        fv = str(self.for_votes.get(proposal_id, u256(0)))
        av = str(self.against_votes.get(proposal_id, u256(0)))
        prompt = (
            f"DAO Proposal Analysis:\\n"
            f"Title: {title}\\n"
            f"Description: {description}\\n"
            f"For votes: {fv}, Against votes: {av}\\n\\n"
            f"Respond with JSON: {{\\"summary\\": \\"one sentence\\", "
            f"\\"risk_score\\": 0-100, \\"recommendation\\": \\"approve\\" or \\"reject\\"}}"
        )
        def run(prompt):
            result = gl.nondet.exec_prompt(prompt)
            import re
            m = re.search(r'\\{.*\\}', result, re.DOTALL)
            return m.group(0) if m else result
        result = gl.eq_principle_strict_eq(run, prompt)
        self.proposal_ai_summaries[proposal_id] = result
        return result

    @gl.public.view
    def get_frontend_actions_json(self) -> str:
        return json.dumps({
            "propose": "create_proposal(title, description)",
            "vote_yes": "vote(proposal_id, True)",
            "vote_no": "vote(proposal_id, False)",
            "list": "get_open_proposals_json()",
            "detail": "get_proposal_json(proposal_id)",
            "analyze": "analyze_proposal_with_ai(proposal_id)",
            "execute": "execute_proposal(proposal_id)",
        }, sort_keys=True)

    @gl.public.view
    def get_test_checklist_json(self) -> str:
        return json.dumps([
            "Create a proposal as a member",
            "Reject proposal from non-member",
            "Vote yes as member",
            "Reject duplicate vote",
            "Vote no as another member",
            "Execute proposal — passes if for > against",
            "Analyze proposal with AI",
            "Reject execution of closed proposal",
        ], sort_keys=True)
`,
  task: `Add \`get_frontend_actions_json()\` mapping: propose, vote_yes, vote_no, list, detail, analyze, execute.`,
  hints: [
    "Use json.dumps({...}, sort_keys=True).",
    "Include at least 5 action keys.",
    "Key line: `'analyze': 'analyze_proposal_with_ai(proposal_id)'`",
  ],
};

export default content;
