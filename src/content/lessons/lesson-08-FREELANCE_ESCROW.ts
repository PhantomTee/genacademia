import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 8,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 8 — Job Budgets with u256

### What You'll Learn
Store job budgets as \`u256\` — the correct type for all on-chain monetary amounts.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class TrustLance(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str
    job_count: u256
    job_clients: TreeMap[str, Address]
    job_budgets: TreeMap[str, u256]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)

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


`,
  task: `Add \`job_budgets: TreeMap[str, u256]\` as a class-level field. Update \`create_job\` so it also accepts a \`budget: u256\` parameter and stores it in \`job_budgets[job_id]\`.`,
  hints: [
    "Declare job_budgets: TreeMap[str, u256] at class level.",
    "Store the budget using: self.job_budgets[job_id] = budget.",
    "Key line: `self.job_budgets[job_id] = budget`",
  ],
};

export default content;
