import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 6 — Job Storage Fields

### What You'll Learn
Add \`job_count: u256\` — a persistent counter for job IDs. Every new job gets a unique ID derived from this counter.`,
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

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "TrustLance"
        self.platform_description = "A GenLayer freelance escrow platform."
        self.job_count = u256(0)
`,
  task: `Initialize \`job_count\` to \`u256(0)\` in the constructor. Add a \`@gl.public.view\` method \`get_job_count()\` that returns it as a string.`,
  hints: [
    "Declare job_count: u256 at class level and initialize with u256(0).",
    "Return str(self.job_count) so the JSON frontend can read it.",
    "Key line: `return str(self.job_count)`",
  ],
};

export default content;
