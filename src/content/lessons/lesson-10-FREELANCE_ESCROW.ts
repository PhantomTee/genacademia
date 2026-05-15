import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 10,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 10 — Major Upgrade: Create a Job

### What You'll Learn
Build the complete \`create_job()\` method with full validation, address capture, TreeMap storage, and counter increment.

### How It Works
A properly validated create method checks all inputs before writing any state.`,
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
  task: `Complete \`create_job(self, title: str, description: str, budget: u256) -> str\` with: 3 input validations (non-empty title, non-empty description, budget > 0), all field assignments, counter increment, return the job ID.`,
  hints: [
    "Validate all 3 inputs with assert statements before writing state.",
    "Increment: self.job_count = self.job_count + u256(1).",
    "Key line: `assert budget > u256(0), 'Budget must be greater than zero'`",
  ],
};

export default content;
