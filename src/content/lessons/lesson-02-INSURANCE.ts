import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "INSURANCE",
  explanation: `## Lesson 2 — CaseWise Contract Skeleton

### What You'll Learn

You'll learn the basic contract skeleton for CaseWise:

dependency header
GenLayer import
contract class
persistent owner
constructor
court name

### How It Works

The owner is the deployer:

\`\`\`python
self.owner = gl.message.sender_address
\`\`\`

In this track, the owner represents the first arbitrator/admin. Later, the owner can finalize rulings after AI review.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"

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
`,
  task: `Add a persistent field:

court_rules: str
Initialize it with:

Parties submit cases and evidence for AI-assisted review.`,
  hints: [
    "Add a persistent field:.",
    "court_rules: str",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
