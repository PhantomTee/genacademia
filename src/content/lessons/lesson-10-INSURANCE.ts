import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 10,
  projectPath: "INSURANCE",
  explanation: `## Lesson 10 — Capstone: Full Claim Verification

This capstone combines everything from Lessons 6–9 into a complete claim-filing function: live data fetch, AI analysis, threshold check, and state update.

### The Full Flow

\`file_and_verify_claim\` is the core insurance operation. It must:

1. **Fetch** live flight data from the API.
2. **Ask** the LLM whether the delay exceeds 3 hours (180 minutes).
3. **Enforce** the threshold — revert if the LLM says delay < 180 minutes.
4. **Update** the caller's policy status to \`"CLAIMED"\`.

### Putting It All Together

\`\`\`python
@gl.public.write
def file_and_verify_claim(self, flight_number: str) -> None:
    safe = self._safe_flight(flight_number)
    raw = gl.nondet.web.get(self.flight_api_url + safe)
    prompt = (
        f"Flight data: {raw[:1500]}\\n\\n"
        f"Was flight {safe} delayed more than 3 hours? "
        'JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer, "reason": string}'
    )
    result = gl.nondet.exec_prompt(prompt, response_format="json")
    if result.get("delay_minutes", 0) < 180:
        raise gl.vm.UserError("delay threshold not met")
    # mark caller's policy as CLAIMED (full policy mapping added in L11)
    self.last_claim_status = "CLAIMED"
\`\`\`

### Threshold Logic

The 180-minute threshold (3 hours) is the contractual trigger. Checking the integer value from the AI's JSON response is more reliable than checking the text status field, because it allows for graduated logic in later lessons.

### What is Missing?

You are storing \`last_claim_status\` as a simple string for now. In Lessons 11–12 you will add a \`TreeMap\` and a \`Policy\` dataclass so each holder has their own policy record.

### Key Takeaways

- Chain web.get → exec_prompt in sequence for real-world verification.
- Enforce numeric thresholds on the parsed JSON result.
- Revert with UserError when the claim does not meet criteria.`,
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
    last_claim_status: str

    def __init__(self, name: str, pool_id: u256) -> None:
        self.pool_name = name
        self.holder_count = 0
        self.insurer = gl.message.sender_address
        self.pool_id = pool_id
        self.accepting_enrollments = True
        self.flight_api_url = "https://api.aviationstack.com/v1/flights?flight_iata="
        self.last_claim_status = ""

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    def _safe_flight(self, flight: str) -> str:
        return ''.join(c for c in flight if c.isalnum())[:10]

    @gl.public.write
    def file_and_verify_claim(self, flight_number: str) -> None:
        # TODO: fetch flight data, call exec_prompt for JSON status,
        # require delay_minutes >= 180, then set self.last_claim_status = "CLAIMED"
        pass`,
  task: "Implement `file_and_verify_claim()` to fetch flight data with `web.get`, verify the delay via `exec_prompt` JSON, raise UserError if `delay_minutes < 180`, and set `self.last_claim_status = \"CLAIMED\"`.",
  hints: [
    "Start with `safe = self._safe_flight(flight_number)` then `raw = gl.nondet.web.get(self.flight_api_url + safe)`.",
    "Build the prompt with the raw data and call `result = gl.nondet.exec_prompt(prompt, response_format=\"json\")`.",
    "Check `if result.get(\"delay_minutes\", 0) < 180: raise gl.vm.UserError(\"delay threshold not met\")`, then set `self.last_claim_status = \"CLAIMED\"`.",
  ],
};

export default content;
