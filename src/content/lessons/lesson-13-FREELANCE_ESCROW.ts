import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 13 — Listing Open Jobs

### What You'll Learn
Build \`get_open_jobs_json()\` by looping \`job_ids\` and filtering for \`"open"\` status.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


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



    job_ids: DynArray[str]

    @gl.public.view
    def get_job_json(self, job_id: str) -> str:
        assert job_id in self.job_titles, "Job not found"
        return json.dumps({"id": job_id, "title": self.job_titles[job_id], "budget": str(self.job_budgets[job_id]), "status": self.job_statuses[job_id]}, sort_keys=True)
`,
  task: `Add \`get_open_jobs_json(self) -> str\` that loops \`job_ids\`, filters by \`job_statuses[job_id] == "open"\`, and returns a JSON array.`,
  hints: [
    "Loop: for job_id in self.job_ids: check if status == 'open'.",
    "Build a list and return json.dumps(result, sort_keys=True).",
    "Key line: `if self.job_statuses[job_id] == 'open':`",
  ],
};

export default content;
