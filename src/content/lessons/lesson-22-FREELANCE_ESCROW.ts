import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 22 — Dispute Review with gl.nondet.exec_prompt

### What You'll Learn
Call \`gl.nondet.exec_prompt()\` to send the dispute to the AI and get a verdict. Wrap the call in \`gl.vm.run_nondet_unsafe\` for validator consensus.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass

class TrustLance(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."

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

    job_count: u256
    job_titles: TreeMap[str, str]
    job_descriptions: TreeMap[str, str]
    job_clients: TreeMap[str, Address]
    job_budgets: TreeMap[str, u256]
    job_statuses: TreeMap[str, str]
    job_freelancers: TreeMap[str, Address]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)

    @gl.public.write
    def create_job(self, title: str, description: str, budget: u256) -> str:
        assert len(title) > 0, "Title cannot be empty"
        assert len(description) > 0, "Description cannot be empty"
        assert budget > u256(0), "Budget must be greater than zero"

        job_id = str(self.job_count)
        self.job_titles[job_id] = title
        self.job_descriptions[job_id] = description
        self.job_clients[job_id] = gl.message.sender_address
        self.job_budgets[job_id] = budget
        self.job_statuses[job_id] = "open"
        self.job_count = self.job_count + u256(1)
        return job_id

    job_ids: DynArray[str]

    @gl.public.view
    def get_job_json(self, job_id: str) -> str:
        assert job_id in self.job_titles, "Job not found"
        return json.dumps({
            "id": job_id,
            "title": self.job_titles[job_id],
            "description": self.job_descriptions[job_id],
            "client": self.job_clients[job_id].as_hex,
            "budget": str(self.job_budgets[job_id]),
            "status": self.job_statuses[job_id],
        }, sort_keys=True)

    @gl.public.view
    def get_open_jobs_json(self) -> str:
        result = []
        for job_id in self.job_ids:
            if self.job_statuses[job_id] == "open":
                result.append({"id": job_id, "title": self.job_titles[job_id], "budget": str(self.job_budgets[job_id])})
        return json.dumps(result, sort_keys=True)

    @gl.public.view
    def get_all_jobs_json(self) -> str:
        result = []
        for job_id in self.job_ids:
            result.append({"id": job_id, "title": self.job_titles[job_id], "status": self.job_statuses[job_id]})
        return json.dumps(result, sort_keys=True)

    @gl.public.write
    def close_job(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_clients[job_id], "Only client can close"
        assert self.job_statuses[job_id] == "open", "Only open jobs can be closed"
        self.job_statuses[job_id] = "closed"

    job_escrow: TreeMap[str, u256]
    job_deliveries: TreeMap[str, str]
    freelancer_claimed: TreeMap[str, bool]

    @gl.public.write.payable
    def fund_job(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_clients[job_id], "Only client can fund"
        assert self.job_statuses[job_id] == "open", "Job must be open"
        assert gl.message.value >= self.job_budgets[job_id], "Insufficient funds"
        self.job_escrow[job_id] = gl.message.value
        self.job_statuses[job_id] = "funded"

    @gl.public.write
    def accept_job(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert self.job_statuses[job_id] == "funded", "Job must be funded"
        self.job_freelancers[job_id] = gl.message.sender_address
        self.job_statuses[job_id] = "accepted"

    @gl.public.write
    def submit_delivery(self, job_id: str, delivery_ref: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_freelancers[job_id], "Only freelancer can submit"
        assert self.job_statuses[job_id] == "accepted", "Job must be accepted"
        self.job_deliveries[job_id] = delivery_ref
        self.job_statuses[job_id] = "delivered"

    @gl.public.write
    def confirm_delivery(self, job_id: str) -> None:
        assert job_id in self.job_titles, "Job not found"
        assert gl.message.sender_address == self.job_clients[job_id], "Only client can confirm"
        assert self.job_statuses[job_id] == "delivered", "Delivery must be submitted first"
        assert not self.freelancer_claimed.get(job_id, False), "Already paid"
        self.freelancer_claimed[job_id] = True
        self.job_statuses[job_id] = "completed"
        _Recipient(self.job_freelancers[job_id]).emit_transfer(value=self.job_escrow[job_id])
`,
  task: `Add \`review_dispute_with_ai(self, job_id: str, reason: str) -> str\`. Build a prompt, define an inner function that calls \`gl.nondet.exec_prompt(prompt)\`, then call \`gl.vm.run_nondet_unsafe(run, validate_result)\`.`,
  hints: [
    "Define a nested def run(): inside the method.",
    "Call gl.vm.run_nondet_unsafe(run, validate_result) — not exec_prompt directly.",
    "Key line: `result = gl.vm.run_nondet_unsafe(run, validate_result)`",
  ],
};

export default content;
