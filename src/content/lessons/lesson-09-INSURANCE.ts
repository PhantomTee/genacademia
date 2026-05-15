import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "INSURANCE",
  explanation: `## Lesson 9 — Fetching Live Data with web.get

An LLM's training data has a cutoff date — it cannot know whether today's flight AA123 was delayed. To provide **real-time flight status**, CaseWise fetches live data from an external API before calling the LLM.

### gl.nondet.web.get

\`gl.nondet.web.get(url)\` performs an HTTP GET and returns the response body as a string. Like \`exec_prompt\`, it is non-deterministic and handled by GenLayer's consensus:

\`\`\`python
data = gl.nondet.web.get("https://api.example.com/flights/AA123")
\`\`\`

### Storing the API Base URL

Store the base URL as contract state so the insurer can update it without redeploying:

\`\`\`python
flight_api_url: str

def __init__(self, name: str, pool_id: u256) -> None:
    ...
    self.flight_api_url = "https://api.aviationstack.com/v1/flights?flight_iata="
\`\`\`

### Feeding API Data into the Prompt

Truncate the raw response (which may be very long) before embedding it in the prompt. A 1500-character slice is a safe ceiling:

\`\`\`python
url = self.flight_api_url + safe
raw = gl.nondet.web.get(url)
prompt = (
    f"Flight data: {raw[:1500]}\\n\\n"
    f"Based on the data above, was flight {safe} delayed more than 3 hours? "
    'Respond with JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer, "reason": string}'
)
return gl.nondet.exec_prompt(prompt, response_format="json")
\`\`\`

### Why Truncate?

LLM context windows have limits. Sending an entire API response risks exceeding that limit or diluting the signal. 1500 characters captures the key fields while keeping the prompt manageable.

### Key Takeaways

- \`gl.nondet.web.get(url)\` fetches live HTTP data on-chain.
- Store API base URLs as state for upgradeability.
- Truncate long responses before embedding in prompts.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256

class InsurancePool(gl.Contract):
    pool_name: str
    holder_count: int
    insurer: Address
    pool_id: u256
    accepting_enrollments: bool
    flight_api_url: str

    def __init__(self, name: str, pool_id: u256) -> None:
        self.pool_name = name
        self.holder_count = 0
        self.insurer = gl.message.sender_address
        self.pool_id = pool_id
        self.accepting_enrollments = True
        self.flight_api_url = "https://api.aviationstack.com/v1/flights?flight_iata="

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    def _safe_flight(self, flight: str) -> str:
        return ''.join(c for c in flight if c.isalnum())[:10]

    @gl.public.write
    def verify_delay(self, flight_number: str) -> dict:
        safe = self._safe_flight(flight_number)
        # TODO: fetch live data with gl.nondet.web.get and include in prompt
        pass`,
  task: "Update `verify_delay()` to fetch flight status from `self.flight_api_url + safe_flight` using `gl.nondet.web.get`, include the first 1500 characters in the LLM prompt, and return the JSON result.",
  hints: [
    "Call `raw = gl.nondet.web.get(self.flight_api_url + safe)` to fetch the live data.",
    "Build the prompt with `f\"Flight data: {raw[:1500]}\\n\\n...\"` to include the API response.",
    "Then call `return gl.nondet.exec_prompt(prompt, response_format=\"json\")` as before.",
  ],
};

export default content;
