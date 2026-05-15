import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 17,
  projectPath: "INSURANCE",
  explanation: `## Lesson 17 — Non-Comparative Equivalence

In Lesson 16 you wrote a validator that checks whether the result has the right keys. But if you accidentally wrote \`r == expected_value\`, every validator would need to independently fetch the same data and get a byte-for-byte identical response — which is impossible for live APIs.

**Non-comparative** equivalence means validating *structure and plausibility*, not exact values:

\`\`\`python
def _validate_verify(self, r) -> bool:
    if not isinstance(r, dict):
        return False
    delay = r.get("delay_minutes")
    status = r.get("status")
    if not isinstance(delay, int) or delay < 0:
        return False
    if status not in ["DELAYED", "ON_TIME"]:
        return False
    return True
\`\`\`

This validator accepts *any* result where:
- \`delay_minutes\` is a non-negative integer — plausible flight delay.
- \`status\` is one of the two valid labels — no free-form strings.

What it does **not** check: whether the delay minutes match the status, or whether the specific flight number was real. Those are semantic checks that would require another round of network calls. Non-comparative validators stick to structural and range checks only.

This design is a core GenLayer principle. Validators reduce the attack surface (they cannot be tricked by network noise) while still catching obviously malformed results like negative delays or invented status codes.`,
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
        # TODO: rewrite — non-comparative check: delay_minutes is non-negative int,
        # status is "DELAYED" or "ON_TIME"
        return r == r  # BUG: exact equality — replace this

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
`,
  task: "Rewrite `_validate_verify()` to check non-comparatively: `delay_minutes` must be a non-negative integer and `status` must be either `\"DELAYED\"` or `\"ON_TIME\"`.",
  hints: [
    "Non-comparative means checking *structure and range*, not comparing to a known value. The validator must not re-fetch any data.",
    "`delay = r.get(\"delay_minutes\"); if not isinstance(delay, int) or delay < 0: return False` — this rejects negative delays and non-integer values.",
    "`if r.get(\"status\") not in [\"DELAYED\", \"ON_TIME\"]: return False; return True` — close with a final `return True` after all checks pass.",
  ],
};

export default content;
