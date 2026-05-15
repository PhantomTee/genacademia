import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 4,
  projectPath: "DAO",
  explanation: `## Lesson 4 — Updating DAO Description

### What You'll Learn
Use \`@gl.public.write\` to let the owner update the DAO description. Non-owners get an assertion error.`,
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
    def get_dao_name(self) -> str: return self.dao_name

    @gl.public.view
    def get_dao_description(self) -> str: return self.dao_description

    @gl.public.view
    def get_owner(self) -> str: return self.owner.as_hex
`,
  task: `Add \`update_dao_description(self, new_description: str)\` with \`@gl.public.write\`. Validate caller is owner and description is non-empty.`,
  hints: [
    "Check sender == self.owner first.",
    "Add a second assert: len(new_description) > 0, 'Description cannot be empty'.",
    "Key line: `assert gl.message.sender_address == self.owner, 'Only owner can update'`",
  ],
};

export default content;
