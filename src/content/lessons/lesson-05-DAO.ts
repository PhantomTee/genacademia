import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "DAO",
  explanation: `## Lesson 5 — Major Upgrade: DAO Identity Contract

### What You'll Learn
Combine owner, dao_name, dao_description, view methods, write methods, and a summary getter into a complete identity contract.`,
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
    def get_dao_name(self) -> str:
        return self.dao_name

    @gl.public.view
    def get_dao_description(self) -> str:
        return self.dao_description

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.dao_name + ": " + self.dao_description

    @gl.public.write
    def update_dao_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update"
        assert len(new_description) > 0, "Description cannot be empty"
        self.dao_description = new_description
`,
  task: `Add \`get_contract_summary(self) -> str\` that returns \`self.dao_name + ": " + self.dao_description\`.`,
  hints: [
    "Concatenate the two fields with ': ' in between.",
    "No line break or extra formatting needed.",
    "Key line: `return self.dao_name + ': ' + self.dao_description`",
  ],
};

export default content;
