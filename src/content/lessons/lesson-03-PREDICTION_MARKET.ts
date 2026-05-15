import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 3,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 3 — Reading Market Metadata

### What You'll Learn

You'll learn how to expose read-only contract state using @gl.public.view.

### How It Works

A view method reads state without changing it:

\`\`\`python
@gl.public.view
\`\`\`

This is the method a frontend would call to display public information.`,
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
`,
  expectedCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

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
  task: `Add two new view methods:

get_platform_description()
get_owner()
get_owner() should return the owner as hex:

return self.owner.as_hex`,
  hints: [
    "Add two new view methods:.",
    "get_platform_description()",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
