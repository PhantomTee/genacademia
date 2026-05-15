import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 4 — Updating Market Metadata

### What You'll Learn

Students learn how to modify state using @gl.public.write, and why write methods need permission checks.

Writing to Intelligent Contracts modifies state and needs network processing, unlike read calls.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str
    platform_description: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
        self.platform_description = "A GenLayer prediction market that uses AI-assisted resolution."

    @gl.public.view
    def get_platform_name(self) -> str:
        return self.platform_name

    @gl.public.view
    def get_platform_description(self) -> str:
        return self.platform_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex
`,
  task: `Add a write method:

update_platform_description(new_description: str)
Rules:

Only owner can update it.
Description cannot be empty.`,
  hints: [
    "Add a write method:.",
    "update_platform_description(new_description: str)",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
