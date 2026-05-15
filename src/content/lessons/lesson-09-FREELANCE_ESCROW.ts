import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 9 — Job Records with TreeMap

### What You'll Learn
Add title, description, and status fields as \`TreeMap[str, str]\` to store complete job records per ID.`,
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
`,
  task: `Add \`job_titles\`, \`job_descriptions\`, and \`job_statuses\` as \`TreeMap[str, str]\` fields. Update \`create_job_stub\` to store all three, setting status to \`"open"\`.`,
  hints: [
    "Add three TreeMap[str, str] fields at class level.",
    "Set job_statuses[job_id] = 'open' in the creation method.",
    "Key line: `self.job_statuses[job_id] = 'open'`",
  ],
};

export default content;
