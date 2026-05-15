import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "DAO",
  explanation: `## Lesson 3 — DAO Info View

### What You'll Learn
Expose DAO metadata with \`@gl.public.view\` — gas-free reads for the governance UI.`,
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
`,
  task: `Add \`get_dao_description()\` and \`get_owner()\` as \`@gl.public.view\` methods. get_owner() returns \`self.owner.as_hex\`.`,
  hints: [
    "Both methods need the @gl.public.view decorator.",
    "get_owner should return a string not an Address object.",
    "Key line: `return self.owner.as_hex`",
  ],
};

export default content;
