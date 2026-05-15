import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 18,
  projectPath: "INSURANCE",
  explanation: `## Lesson 18 — web.render: Flight Board Screenshot

\`gl.nondet.web.get(url)\` fetches raw HTML text — useful for JSON APIs but useless for JavaScript-heavy departure boards that render flight statuses client-side. \`gl.nondet.web.render(url)\` solves this: it runs a headless browser, waits for JavaScript to execute, and returns a **PNG screenshot as bytes**.

\`\`\`python
@gl.public.write
def get_flight_board_screenshot(self, airport_code: str) -> bytes:
    url = f"https://flightaware.com/live/airport/{airport_code}"
    return gl.nondet.web.render(url)
\`\`\`

The returned \`bytes\` value is a raw PNG. It can be:
- Returned directly to a caller who wants to display the board.
- Passed to \`gl.nondet.exec_prompt(prompt, images=[screenshot])\` for AI visual analysis (Lesson 19).
- Stored off-chain as evidence for an insurance claim.

**Constructing the URL** from a user-supplied \`airport_code\` keeps the method generic — the same contract method works for any airport. Always sanitise user input before embedding it in a URL; in production you would validate that \`airport_code\` is exactly 3–4 uppercase letters.

Note: \`web.render\` is slower and more expensive than \`web.get\`. Use \`web.get\` when the page is static JSON, and reserve \`web.render\` for pages that require JavaScript rendering or when you need a visual record.`,
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
        pass  # TODO: render the FlightAware airport page and return the bytes
`,
  task: "Implement `get_flight_board_screenshot()` to render a FlightAware airport departure board using `gl.nondet.web.render()` and return the screenshot bytes.",
  hints: [
    "`gl.nondet.web.render(url)` runs a headless browser and returns PNG bytes — unlike `web.get` which returns raw HTML text.",
    "Construct the URL from the airport code: `url = f\"https://flightaware.com/live/airport/{airport_code}\"`.",
    "`return gl.nondet.web.render(f\"https://flightaware.com/live/airport/{airport_code}\")` — one line is all you need.",
  ],
};

export default content;
