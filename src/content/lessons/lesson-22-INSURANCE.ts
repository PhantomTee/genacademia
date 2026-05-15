import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 22,
  projectPath: "INSURANCE",
  explanation: `## Lesson 22 — gl.send: Pay Out Claims

Collecting premiums is only half the equation. When a verified claim is approved, CaseWise must send GEN tokens to the policyholder. \`gl.send(address, amount)\` transfers \`amount\` wei from the contract's own balance to \`address\`.

\`\`\`python
@gl.public.write
def pay_out_claim(self, holder: Address) -> None:
    if gl.message.sender_address != self.insurer:
        raise gl.vm.UserError("unauthorized")
    policy = self.policies.get(holder, None)
    if policy is None:
        raise gl.vm.UserError("not enrolled")
    if policy.status != "CLAIMED":
        raise gl.vm.UserError("not in CLAIMED state")
    if int(self.pool_balance) < int(policy.coverage):
        raise gl.vm.UserError("insufficient pool balance")
    gl.send(holder, policy.coverage)
    self.pool_balance -= policy.coverage
    policy.status = "PAID"
    self.policies[holder] = policy
\`\`\`

Key points:

- \`gl.send\` is a **non-deterministic** operation — it moves real tokens, so validators must reach consensus before it executes.
- Always check \`pool_balance >= coverage\` before sending; reverting after \`gl.send\` would not undo the transfer.
- Decrement \`self.pool_balance\` by the exact coverage amount to keep the mirror accurate.
- Transition the policy to \`PAID\` in the same transaction — atomic state change prevents double-pay.

This method is separate from \`pay_claim\` (which just updates status). Real deployments sometimes merge them; keeping them separate here makes the learning progression clearer.`,
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
    pool_balance: u256

    def __init__(self, pool_name: str, flight_api_url: str) -> None:
        self.pool_name = pool_name
        self.insurer = gl.message.sender_address
        self.holder_count = 0
        self.flight_api_url = flight_api_url
        self.policies = TreeMap[Address, Policy]()
        self.pool_balance = u256(0)

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.write.payable
    def enroll(self, flight_number: str) -> None:
        premium = gl.message.value
        if premium < 10**15:
            raise gl.vm.UserError("premium too low")
        sender = gl.message.sender_address
        policy = Policy(holder=sender, flight_number=flight_number, premium=premium, coverage=premium * 10)
        self.policies[sender] = policy
        self.pool_balance += premium
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
        return {"holder_count": self.holder_count, "pool_balance": int(self.pool_balance)}

    @gl.public.write
    def pay_out_claim(self, holder: Address) -> None:
        pass  # TODO: insurer only, policy CLAIMED → send coverage → mark PAID → reduce pool_balance

    def _leader_verify(self, flight: str) -> dict:
        data = gl.nondet.web.get(self.flight_api_url + flight)
        board = gl.nondet.web.render(f"https://flightaware.com/live/airport/{flight[:3]}")
        prompt = (
            f"API data: {data[:800]}\\n\\n"
            f"Is flight {flight} delayed? "
            'Respond with JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer}'
        )
        return gl.nondet.exec_prompt(prompt, images=[board], response_format="json")

    def _validate_verify(self, r) -> bool:
        if not isinstance(r, dict):
            return False
        delay = r.get("delay_minutes")
        if not isinstance(delay, int) or delay < 0:
            return False
        return r.get("status") in ["DELAYED", "ON_TIME"]

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
  task: "Implement `pay_out_claim()` (insurer-only): check policy is `CLAIMED`, verify sufficient `pool_balance`, send `policy.coverage` to the holder via `gl.send`, decrement `pool_balance`, and mark the policy `PAID`.",
  hints: [
    "Guard order: insurer check → policy exists check → status == CLAIMED check → balance check — each guard raises `UserError` on failure.",
    "`if int(self.pool_balance) < int(policy.coverage): raise gl.vm.UserError(\"insufficient pool balance\")` — compare as int to avoid u256 comparison issues.",
    "`gl.send(holder, policy.coverage); self.pool_balance -= policy.coverage; policy.status = PAID; self.policies[holder] = policy`",
  ],
};

export default content;
