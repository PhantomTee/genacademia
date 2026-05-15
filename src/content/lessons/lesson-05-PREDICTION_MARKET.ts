import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 5 — Major Upgrade: Prediction Market Identity Contract

### What You'll Learn

You'll combine everything from lessons 1–4 into the first complete PredictX identity contract.`,
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

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.platform_name + ": " + self.platform_description

    @gl.public.write
    def update_platform_description(self, new_description: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update description"
        assert len(new_description) > 0, "Description cannot be empty"

        self.platform_description = new_description
`,
  task: `Add one more view method:

get_contract_summary()
It should return a readable string containing the name and description.`,
  hints: [
    "Add one more view method:.",
    "get_contract_summary()",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
