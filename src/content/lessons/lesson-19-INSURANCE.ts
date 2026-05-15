import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 19,
  projectPath: "INSURANCE",
  explanation: `## Lesson 19 — Multi-Modal AI

Text-only LLM calls are limited to whatever an API returns as JSON or HTML. Departure boards, timetable PDFs, and airline display screens often have no machine-readable equivalent. The \`images=[]\` keyword argument to \`gl.nondet.exec_prompt\` unlocks visual reasoning: pass PNG bytes alongside the prompt and the model can read what's on screen.

\`\`\`python
@gl.public.write
def visual_verify_delay(self, flight: str, board_url: str) -> str:
    screenshot: bytes = gl.nondet.web.render(board_url)
    prompt = (
        f"Is flight {flight} shown as DELAYED on this airport board? "
        "Answer with exactly one word: DELAYED or ON_TIME."
    )
    answer = gl.nondet.exec_prompt(prompt, images=[screenshot])
    return answer.strip().upper()
\`\`\`

A few points to notice:

- **No \`response_format="json"\`** — you are asking for a single word, not structured data, so plain text mode is fine.
- **\`images=[screenshot]\`** — the list can contain multiple images; here we pass exactly one.
- **\`strip().upper()\`** — normalise the response in case the model adds whitespace or returns lowercase.

This method gives CaseWise a second, independent evidence channel. When a policyholder files a claim, the insurer can call both \`verify_delay\` (API data) and \`visual_verify_delay\` (rendered board) and require them to agree before paying out.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


ACTIVE = "ACTIVE"
CLAIMED = "CLAIMED"
PAID = "PAID"
DENIED = "DENIED"


@dataclass
class Policy:
    holder: Address
    flight_number: str
    premium: u256
    coverage: u256
    status: str = "ACTIVE"


class InsurancePool(gl.Contract):
    pool_name: str
    insurer: Address
    holder_count: int
    flight_api_url: str
    policies: TreeMap[Address, Policy]

    def __init__(self, pool_name: str, flight_api_url: str) -> None:
        self.pool_name = pool_name
        self.insurer = gl.message.sender_address
        self.holder_count = 0
        self.flight_api_url = flight_api_url
        self.policies = TreeMap[Address, Policy]()

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        sender = gl.message.sender_address
        policy = Policy(holder=sender, flight_number=flight_number, premium=0, coverage=0)
        self.policies[sender] = policy
        self.holder_count += 1

    @gl.public.write
    def file_claim(self) -> None:
        sender = gl.message.sender_address
        policy = self.policies.get(sender, None)
        if policy is None:
            raise gl.vm.UserError("not enrolled")
        if policy.status != ACTIVE:
            raise gl.vm.UserError("already claimed")
        policy.status = CLAIMED
        self.policies[sender] = policy

    @gl.public.write
    def pay_claim(self, holder: Address) -> None:
        if gl.message.sender_address != self.insurer:
            raise gl.vm.UserError("unauthorized")
        policy = self.policies[holder]
        if policy.status != CLAIMED:
            raise gl.vm.UserError("not in CLAIMED state")
        policy.status = PAID
        self.policies[holder] = policy

    @gl.public.write
    def deny_claim(self, holder: Address) -> None:
        if gl.message.sender_address != self.insurer:
            raise gl.vm.UserError("unauthorized")
        policy = self.policies[holder]
        if policy.status != CLAIMED:
            raise gl.vm.UserError("not in CLAIMED state")
        policy.status = DENIED
        self.policies[holder] = policy

    @gl.public.view
    def get_claim_status(self, holder: Address) -> str:
        policy = self.policies.get(holder, None)
        if policy is None:
            raise gl.vm.UserError("not enrolled")
        return policy.status

    @gl.public.view
    def get_pool_stats(self) -> dict:
        return {"holder_count": self.holder_count, "pool_balance": 0}

    def _leader_verify(self, flight: str) -> dict:
        data = gl.nondet.web.get(self.flight_api_url + flight)
        prompt = (
            f"Flight data: {data[:1500]}\\n\\n"
            f"Is flight {flight} delayed? "
            'Respond with JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer}'
        )
        return gl.nondet.exec_prompt(prompt, response_format="json")

    def _validate_verify(self, r) -> bool:
        if not isinstance(r, dict):
            return False
        delay = r.get("delay_minutes")
        if not isinstance(delay, int) or delay < 0:
            return False
        if r.get("status") not in ["DELAYED", "ON_TIME"]:
            return False
        return True

    @gl.public.write
    def verify_delay(self, holder: Address) -> str:
        policy = self.policies.get(holder, None)
        if policy is None:
            raise gl.vm.UserError("no policy found")
        result = gl.vm.run_nondet_unsafe(
            lambda: self._leader_verify(policy.flight_number),
            lambda r: self._validate_verify(r),
        )
        return result["status"]

    @gl.public.write
    def get_flight_board_screenshot(self, airport_code: str) -> bytes:
        return gl.nondet.web.render(f"https://flightaware.com/live/airport/{airport_code}")

    @gl.public.write
    def visual_verify_delay(self, flight: str, board_url: str) -> str:
        pass  # TODO: render board_url, pass screenshot to exec_prompt with images=[screenshot]
`,
  task: "Implement `visual_verify_delay()` to render the flight board screenshot with `web.render`, then pass it to `exec_prompt` asking whether the specified flight is shown as delayed. Return `\"DELAYED\"` or `\"ON_TIME\"`.",
  hints: [
    "First render: `screenshot = gl.nondet.web.render(board_url)` — this returns PNG bytes.",
    "Then prompt with the image: `answer = gl.nondet.exec_prompt(f\"Is flight {flight} shown as DELAYED on this board? Answer DELAYED or ON_TIME.\", images=[screenshot])`.",
    "`return answer.strip().upper()` — normalise whitespace and casing so callers always receive exactly `\"DELAYED\"` or `\"ON_TIME\"`.",
  ],
};

export default content;
