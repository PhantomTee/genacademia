import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "INSURANCE",
  explanation: `## Lesson 6 — AI Verification with exec_prompt

This is the heart of what makes CaseWise an **intelligent contract**: using a Large Language Model directly inside on-chain execution to verify real-world facts.

### gl.nondet.exec_prompt

\`gl.nondet.exec_prompt\` sends a text prompt to an LLM and returns the response. Because it calls an external AI service, it is **non-deterministic** — different validators may get slightly different responses. GenLayer's consensus mechanism handles this automatically.

\`\`\`python
result = gl.nondet.exec_prompt(
    "Was flight AA123 delayed more than 3 hours? Answer DELAYED or ON_TIME only."
)
\`\`\`

### Structuring the Prompt

Good prompts are specific and constrained. For delay verification:

1. Name the flight explicitly.
2. Set the threshold (3 hours).
3. Force a binary output to make parsing easy.

\`\`\`python
prompt = (
    f"Was flight {flight_number} delayed more than 3 hours today? "
    "Answer with exactly one word: DELAYED or ON_TIME."
)
result = gl.nondet.exec_prompt(prompt)
return result.strip().upper()
\`\`\`

### Why Non-Determinism is Safe

GenLayer runs the same method on multiple validator nodes. Each calls the LLM independently. The consensus layer aggregates the responses — if a supermajority agrees on the result, it is committed. Outliers are ignored. This means AI-powered checks are tamper-resistant without requiring a trusted oracle.

### Key Takeaways

- \`gl.nondet.exec_prompt(prompt)\` queries an LLM and returns plain text.
- Constrain output format in the prompt to make parsing reliable.
- Non-determinism is resolved by GenLayer's consensus — not your code.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256

class InsurancePool(gl.Contract):
    pool_name: str
    holder_count: int
    insurer: Address
    pool_id: u256
    accepting_enrollments: bool

    def __init__(self, name: str, pool_id: u256) -> None:
        self.pool_name = name
        self.holder_count = 0
        self.insurer = gl.message.sender_address
        self.pool_id = pool_id
        self.accepting_enrollments = True

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        if not self.accepting_enrollments:
            raise gl.vm.UserError("enrollment closed")
        if len(flight_number) < 5:
            raise gl.vm.UserError("invalid flight number")
        self.holder_count += 1

    @gl.public.write
    def verify_delay(self, flight_number: str) -> str:
        # TODO: call gl.nondet.exec_prompt asking if the flight was delayed
        # more than 3 hours; return "DELAYED" or "ON_TIME"
        pass`,
  task: "Implement `verify_delay()` to call `gl.nondet.exec_prompt` asking the LLM whether the flight was delayed more than 3 hours, returning \"DELAYED\" or \"ON_TIME\".",
  hints: [
    "Build a prompt string that names the flight and asks for a binary DELAYED/ON_TIME answer.",
    "Call `result = gl.nondet.exec_prompt(prompt)` and then process the response.",
    "Return `result.strip().upper()` — this cleans whitespace and normalises the LLM output to uppercase.",
  ],
};

export default content;
