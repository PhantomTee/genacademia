import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 21,
  projectPath: "INSURANCE",
  explanation: `## Lesson 21 — Payable: Premium Payment

Until now \`enroll()\` accepted any caller for free. Real insurance requires collecting a premium. GenLayer payable methods receive GEN tokens alongside the call via \`gl.message.value\` (a \`u256\` measured in wei, where 1 GEN = 10^18 wei).

Change the decorator from \`@gl.public.write\` to \`@gl.public.write.payable\`:

\`\`\`python
@gl.public.write.payable
def enroll(self, flight_number: str) -> None:
    premium = gl.message.value
    if premium < 10**15:           # minimum 0.001 GEN
        raise gl.vm.UserError("premium too low")
    sender = gl.message.sender_address
    policy = Policy(
        holder=sender,
        flight_number=flight_number,
        premium=premium,
        coverage=premium * 10,     # 10x leverage for the holder
    )
    self.policies[sender] = policy
    self.pool_balance += premium
    self.holder_count += 1
\`\`\`

Three changes from the non-payable version:
1. \`@gl.public.write.payable\` — signals to the VM that this method accepts GEN.
2. \`gl.message.value\` — the amount sent with the call, in wei.
3. \`self.pool_balance += premium\` — the contract keeps a running tally. The actual GEN is held in the contract's account; \`pool_balance\` just mirrors it for view functions.

Setting \`coverage = premium * 10\` is a placeholder ratio. Production insurance uses actuarial tables, but 10x is a reasonable starting point for a learning contract.`,
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

    @gl.public.write          # TODO: change to @gl.public.write.payable
    def enroll(self, flight_number: str) -> None:
        sender = gl.message.sender_address
        # TODO: read gl.message.value as premium, enforce minimum 10**15 wei
        # TODO: set policy.premium and policy.coverage = premium * 10
        # TODO: add premium to self.pool_balance
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
        return {"holder_count": self.holder_count, "pool_balance": int(self.pool_balance)}

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
  task: "Change `enroll()` to `@gl.public.write.payable`, require a minimum premium of `10**15` wei from `gl.message.value`, store it in `policy.premium`, set `policy.coverage` to `premium * 10`, and add the premium to `self.pool_balance`.",
  hints: [
    "Change the decorator to `@gl.public.write.payable` — without this the VM will reject any call that sends GEN.",
    "`premium = gl.message.value; if premium < 10**15: raise gl.vm.UserError(\"premium too low\")` — enforce the minimum before creating the policy.",
    "`policy = Policy(holder=sender, flight_number=flight_number, premium=premium, coverage=premium * 10); self.policies[sender] = policy; self.pool_balance += premium; self.holder_count += 1`",
  ],
};

export default content;
