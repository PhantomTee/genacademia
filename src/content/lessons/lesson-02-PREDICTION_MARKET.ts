import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 2 — PredictX Contract Skeleton

### What You'll Learn

Students learn the basic structure of a GenLayer Intelligent Contract: dependency header, imports, class declaration, typed state variables, and constructor.

They create the first real contract skeleton with an owner and a platform name.

### How It Works

This line stores the deployer:

\`\`\`python
self.owner = gl.message.sender_address
gl.message.sender_address is the address that called the constructor during deployment.
\`\`\`

The variable:

owner: Address
must be declared at class level so it is persistent contract state.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class PredictX(gl.Contract):
    owner: Address
    platform_name: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.platform_name = "PredictX"
`,
  task: `Add a second persistent field:

platform_description: str
Then initialize it in the constructor with:

A GenLayer prediction market that uses AI-assisted resolution.`,
  hints: [
    "Add a second persistent field:.",
    "platform_description: str",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
