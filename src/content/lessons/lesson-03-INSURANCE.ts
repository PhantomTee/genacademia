import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "INSURANCE",
  explanation: `## Lesson 3 — Court Info View

### What You'll Learn

Students learn how to expose court metadata with @gl.public.view.

The frontend needs to show:

court name
court rules
owner/arbitrator address`,
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
`,
  expectedCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

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
get_court_name() → CaseWise
get_court_rules() → Parties submit cases and evidence for AI-assisted review.
get_owner() → 0x...
`,
  task: `Add two view methods:

get_court_rules()
get_owner()
get_owner() should return:

self.owner.as_hex`,
  hints: [
    "Add two view methods:.",
    "get_court_rules()",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
