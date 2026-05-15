import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 7 — Tracking Market Creators

### What You'll Learn

Students learn how to connect market records to the address that created them.

### How It Works

This is not final yet because every market currently uses ID "0". That is intentional for the lesson. The next lessons will replace this with a real counter and index.`,
  starterCode: `Use Lesson 6 code.
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
Calling:

create_market("Will GenLayer grow in 2026?", "Yes", "No")
returns:

0
`,
  task: `Add a method stub for creating markets:

@gl.public.write
def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:
Inside it, create a temporary market ID:

market_id = "0"
Then store:

self.market_creators[market_id] = gl.message.sender_address`,
  hints: [
    "Add a method stub for creating markets:.",
    "@gl.public.write",
    "Key line: `def create_market(self, question: str, outcome_a: str, outcome_b: str) -> str:`",
  ],
};

export default content;
