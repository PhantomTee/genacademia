import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 1 — Your First Intelligent Contract

Welcome to PredictX! You're building a decentralised prediction market on GenLayer where users will bet on whether ETH will exceed $10,000 by December 31, 2025.

Every GenLayer contract is a Python class that inherits from \`gl.Contract\`. State variables are declared as class-level type annotations, and they are automatically persisted on-chain between calls.

\`\`\`python
class PredictionMarket(gl.Contract):
    question: str          # stored on-chain

    def __init__(self, question: str) -> None:
        self.question = question   # set once at deploy time
\`\`\`

To expose a method that callers can read without paying gas, decorate it with \`@gl.public.view\`. View methods must not modify state — they just read and return values.

\`\`\`python
@gl.public.view
def get_question(self) -> str:
    return self.question
\`\`\`

In this lesson you'll implement \`get_question\` so external callers — and later the resolution logic — can always retrieve the market question. This is the foundation every other lesson builds on.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl


class PredictionMarket(gl.Contract):
    question: str

    def __init__(self, question: str) -> None:
        self.question = question

    @gl.public.view
    def get_question(self) -> str:
        pass
`,
  task: "Implement `get_question()` to return the market question stored in `self.question`.",
  hints: [
    "State variables declared as class-level annotations (like `question: str`) are stored on-chain and accessible via `self`.",
    "`@gl.public.view` marks a method as read-only — it can read state but must not change it.",
    "The body is a single line: `return self.question`.",
  ],
};

export default content;
