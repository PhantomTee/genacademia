import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "DAO",
  explanation: `## Lesson 2 — GovMind Contract Skeleton

### What You'll Learn
Add owner and DAO metadata fields. The owner acts as the admin who can add members and execute proposals.`,
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
`,
  task: `Add a persistent \`dao_description: str\` field and initialize it with "An AI-governed decentralised autonomous organisation."`,
  hints: [
    "Declare dao_description: str at class level.",
    "Initialize it in __init__ after dao_name.",
    "Key line: `self.dao_description = 'An AI-governed decentralised autonomous organisation.'`",
  ],
};

export default content;
