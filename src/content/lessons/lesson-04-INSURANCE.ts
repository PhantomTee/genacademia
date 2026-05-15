import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "INSURANCE",
  explanation: `## Lesson 4 — Updating Court Rules

### What You'll Learn

Students learn how to update contract state using @gl.public.write.

They also learn that only the owner should be able to update the dispute court rules.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."

    @gl.public.view
    def get_court_name(self) -> str:
        return self.court_name

    @gl.public.view
    def get_court_rules(self) -> str:
        return self.court_rules

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex
`,
  task: `Add:

update_court_rules(new_rules: str)
Rules:

Only owner can update rules.
Rules cannot be empty.`,
  hints: [
    "Add:.",
    "update_court_rules(new_rules: str)",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
