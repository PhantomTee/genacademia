import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "INSURANCE",
  explanation: `## Lesson 7 — Structured JSON Responses from the LLM

Plain-text responses from an LLM are fragile — a single unexpected word breaks your parser. GenLayer lets you request **structured JSON output** directly from \`exec_prompt\`, which is far more reliable for insurance logic.

### response_format="json"

Pass \`response_format="json"\` as a keyword argument. The runtime instructs the LLM to return valid JSON and parses it for you — the return value is a Python \`dict\`, not a string:

\`\`\`python
result = gl.nondet.exec_prompt(prompt, response_format="json")
# result is a dict, e.g. {"status": "DELAYED", "delay_minutes": 245, "reason": "..."}
\`\`\`

### Defining the Schema in the Prompt

You must describe the expected JSON structure inside the prompt so the LLM knows what to produce:

\`\`\`python
prompt = (
    f"Was flight {flight_number} delayed more than 3 hours today? "
    "Respond with JSON matching this schema: "
    '{"status": "DELAYED or ON_TIME", "delay_minutes": integer, "reason": string}'
)
\`\`\`

### Accessing the Fields

Once you have the dict you can access fields directly:

\`\`\`python
status = result["status"]          # "DELAYED" or "ON_TIME"
minutes = result["delay_minutes"]  # e.g. 245
reason = result["reason"]          # human-readable explanation
\`\`\`

### Why JSON?

Returning structured data lets downstream code (other methods, front-ends, other contracts) consume the result without string parsing. You will use this richer response in the claim-filing logic in later lessons.

### Key Takeaways

- \`response_format="json"\` returns a parsed Python dict.
- Describe the schema in the prompt text.
- Access fields with standard dict syntax.`,
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
    def verify_delay(self, flight_number: str) -> dict:
        # TODO: call exec_prompt with response_format="json"
        # The returned dict should have: status, delay_minutes, reason
        pass`,
  task: "Update `verify_delay()` to use `response_format=\"json\"` and return the full dict with keys `status`, `delay_minutes`, and `reason`.",
  hints: [
    "Build a prompt that describes the JSON schema you expect: `{\"status\": \"DELAYED or ON_TIME\", \"delay_minutes\": integer, \"reason\": string}`.",
    "Call `result = gl.nondet.exec_prompt(prompt, response_format=\"json\")` — the return value is already a Python dict.",
    "Return the dict directly: `return result`.",
  ],
};

export default content;
