import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 20,
  projectPath: "INSURANCE",
  explanation: `## Lesson 20 — CAPSTONE: Advanced AI

This capstone combines everything you have learned about non-deterministic execution: \`run_nondet_unsafe\`, visual AI via \`images=[]\`, and non-comparative validation. The result is a production-grade flight delay verifier that uses three independent evidence sources.

The leader function does all the heavy lifting:

\`\`\`python
def _leader_verify(self, flight: str) -> dict:
    # 1. Fetch structured API data
    data = gl.nondet.web.get(self.flight_api_url + flight)
    # 2. Render the departure board screenshot
    board_url = f"https://flightaware.com/live/airport/{flight[:3]}"
    screenshot = gl.nondet.web.render(board_url)
    # 3. Ask the LLM with both text + image
    prompt = (
        f"API data: {data[:800]}\\n\\n"
        f"Is flight {flight} delayed by >30 min? "
        'Respond JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer}'
    )
    return gl.nondet.exec_prompt(prompt, images=[screenshot], response_format="json")
\`\`\`

The validator stays non-comparative — it checks plausibility, not an exact match:

\`\`\`python
def _validate_verify(self, r) -> bool:
    if not isinstance(r, dict):
        return False
    delay = r.get("delay_minutes")
    return isinstance(delay, int) and delay >= 0 and r.get("status") in ["DELAYED", "ON_TIME"]
\`\`\`

After verification, store the result in the holder's policy for later reference when processing claims. This is the full CaseWise AI engine — it runs trustlessly across all validator nodes.`,
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
        # TODO: fetch API data + render board screenshot + exec_prompt with images
        pass

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
        # TODO: rewrite using run_nondet_unsafe with the new leader that includes images
        policy = self.policies.get(holder, None)
        if policy is None:
            raise gl.vm.UserError("no policy found")
        data = gl.nondet.web.get(self.flight_api_url + policy.flight_number)
        prompt = (
            f"Flight data: {data[:1500]}\\n\\n"
            f"Is flight {policy.flight_number} delayed? "
            'Respond with JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer}'
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        return result["status"]

    @gl.public.write
    def visual_verify_delay(self, flight: str, board_url: str) -> str:
        screenshot = gl.nondet.web.render(board_url)
        answer = gl.nondet.exec_prompt(
            f"Is flight {flight} shown as DELAYED on this board? Answer DELAYED or ON_TIME.",
            images=[screenshot],
        )
        return answer.strip().upper()
`,
  task: "Rewrite `_leader_verify()` to combine `web.get` (API data) + `web.render` (board screenshot) + `exec_prompt` with `images=[screenshot]`. Update `verify_delay()` to use `run_nondet_unsafe` with this enhanced leader and the existing `_validate_verify`.",
  hints: [
    "In `_leader_verify`: call `web.get` for text data, then `web.render` for the screenshot, then `exec_prompt(prompt, images=[screenshot], response_format=\"json\")`.",
    "In `verify_delay`: `result = gl.vm.run_nondet_unsafe(lambda: self._leader_verify(policy.flight_number), lambda r: self._validate_verify(r))` then `return result[\"status\"]`.",
    "Full leader: `data = gl.nondet.web.get(self.flight_api_url + flight); screenshot = gl.nondet.web.render(f\"https://flightaware.com/live/airport/{flight[:3]}\"); return gl.nondet.exec_prompt(f\"API: {data[:800]}\\nIs {flight} delayed? JSON {{status, delay_minutes}}\", images=[screenshot], response_format=\"json\")`",
  ],
};

export default content;
