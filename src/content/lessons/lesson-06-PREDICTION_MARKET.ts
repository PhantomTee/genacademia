import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 6 — Market Storage Fields

### What You'll Learn

You'll learn how to define persistent storage for multiple prediction markets.

Class-level storage fields:

market_questions: TreeMap[str, str]
market_creators: TreeMap[str, Address]
market_statuses: TreeMap[str, str]

### How It Works

A TreeMap stores many records by key. In PredictX, every market gets an ID like "0", "1", or "2", and each map stores one part of the market.`,
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
  task: `Add these persistent fields:

market_questions: TreeMap[str, str]
market_outcome_a: TreeMap[str, str]
market_outcome_b: TreeMap[str, str]
market_creators: TreeMap[str, Address]
market_statuses: TreeMap[str, str]`,
  hints: [
    "Add these persistent fields:.",
    "market_questions: TreeMap[str, str]",
    "Key line: `market_questions: TreeMap[str, str]`",
  ],
};

export default content;
