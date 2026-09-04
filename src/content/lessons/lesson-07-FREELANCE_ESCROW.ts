import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 7 — Client Address Tracking

### What You'll Learn
Store the address of each job's creator (client) in a \`TreeMap[str, Address]\`. The key is the job ID string.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


class TrustLance(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str
    job_count: u256
    job_clients: TreeMap[str, Address]

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
  task: `Add the first version of \`create_job(self, title: str) -> str\` decorated with \`@gl.public.write\`. It should create a job ID from \`str(self.job_count)\`, store the caller's address in \`job_clients[job_id]\`, increment \`job_count\`, and return the job ID.`,
  hints: [
    "Use gl.message.sender_address to capture the caller.",
    "Increment job_count: self.job_count = self.job_count + u256(1).",
    "Key line: `self.job_clients[job_id] = gl.message.sender_address`",
  ],
};

export default content;
