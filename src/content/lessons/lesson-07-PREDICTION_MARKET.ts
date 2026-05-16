import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 7 — Tracking Market Creators

### What You'll Learn

You'll learn how to connect market records to the address that created them.

### How It Works

This is not final yet because every market currently uses ID "0". That is intentional for the lesson. The next lessons will replace this with a real counter and index.`,
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
  expectedCode: `@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:
    market_id = "0"
    self.market_creators[market_id] = gl.message.sender_address
    self.market_questions[market_id] = question
    self.market_outcome_a[market_id] = outcome_a
    self.market_outcome_b[market_id] = outcome_b
    self.market_statuses[market_id] = "active"
    return market_id
`,
  task: `Add the first version of the market creation method:

@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:
Inside it, create a temporary market ID:

market_id = "0"
Then store:

self.market_creators[market_id] = gl.message.sender_address`,
  hints: [
    "Add the first version of create_market.",
    "@gl.public.write",
    "Key line: `def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:`",
  ],
};

export default content;
