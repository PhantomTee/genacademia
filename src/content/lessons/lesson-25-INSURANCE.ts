import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 25,
  projectPath: "INSURANCE",
  explanation: `## Lesson 25 — CAPSTONE: Full Insurance Pool

After a storm grounds dozens of flights, the insurer needs to pay hundreds of claims at once. Calling \`pay_out_claim\` one-by-one would require hundreds of transactions. \`batch_pay_claims\` accepts a \`DynArray[Address]\` of holders and processes all of them in a single transaction.

\`\`\`python
@gl.public.write
def batch_pay_claims(self, holders: DynArray[Address]) -> None:
    if gl.message.sender_address != self.insurer:
        raise gl.vm.UserError("unauthorized")
    for holder in holders:
        policy = self.policies.get(holder, None)
        if policy is None:
            continue               # skip unknown addresses silently
        if policy.status != "CLAIMED":
            continue               # skip non-CLAIMED policies
        if int(self.pool_balance) < int(policy.coverage):
            raise gl.vm.UserError("pool exhausted")
        gl.send(holder, policy.coverage)
        self.pool_balance -= policy.coverage
        policy.status = "PAID"
        self.policies[holder] = policy
\`\`\`

Design decisions:
- **Skip unknowns** — \`continue\` instead of \`raise\` for missing or non-CLAIMED policies. The insurer submitted a list; some may have already been paid.
- **Halt on exhaustion** — raising on insufficient balance protects remaining policyholders; partial processing would be worse than no processing.
- **Insurer-only** — batch payouts move large amounts of GEN; restrict to the insurer.

This is the final core feature of CaseWise. Remaining lessons (26-30) add production hardening: randomness, upgradeability, debugging, and special message handlers.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap, DynArray
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
    incident_index: gl.VectorStorage
    weather_oracle: Address

    def __init__(self, pool_name: str, flight_api_url: str, weather_oracle: Address) -> None:
        self.pool_name = pool_name
        self.insurer = gl.message.sender_address
        self.holder_count = 0
        self.flight_api_url = flight_api_url
        self.policies = TreeMap[Address, Policy]()
        self.pool_balance = u256(0)
        self.incident_index = gl.VectorStorage()
        self.weather_oracle = weather_oracle

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
    def file_claim(self, reason: str) -> None:
        sender = gl.message.sender_address
        policy = self.policies.get(sender, None)
        if policy is None:
            raise gl.vm.UserError("not enrolled")
        if policy.status != ACTIVE:
            raise gl.vm.UserError("already claimed")
        policy.status = CLAIMED
        self.policies[sender] = policy
        self.incident_index.add(reason, {"flight": policy.flight_number, "holder": str(sender)})

    @gl.public.write
    def pay_out_claim(self, holder: Address) -> None:
        if gl.message.sender_address != self.insurer:
            raise gl.vm.UserError("unauthorized")
        policy = self.policies.get(holder, None)
        if policy is None:
            raise gl.vm.UserError("not enrolled")
        if policy.status != CLAIMED:
            raise gl.vm.UserError("not in CLAIMED state")
        if int(self.pool_balance) < int(policy.coverage):
            raise gl.vm.UserError("insufficient pool balance")
        gl.send(holder, policy.coverage)
        self.pool_balance -= policy.coverage
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

    @gl.public.write
    def batch_pay_claims(self, holders: DynArray[Address]) -> None:
        pass  # TODO: insurer only — iterate holders, pay each CLAIMED policy, mark PAID

    @gl.public.view
    def get_claim_status(self, holder: Address) -> str:
        policy = self.policies.get(holder, None)
        if policy is None:
            raise gl.vm.UserError("not enrolled")
        return policy.status

    @gl.public.view
    def get_pool_stats(self) -> dict:
        return {"holder_count": self.holder_count, "pool_balance": int(self.pool_balance)}

    @gl.public.view
    def search_incidents(self, query: str) -> list:
        return self.incident_index.search(query, top_k=5)

    @gl.public.write
    def get_weather_data(self, flight: str) -> str:
        return str(gl.call_contract(self.weather_oracle, "get_flight_weather", [flight]))

    def _leader_verify(self, flight: str) -> dict:
        data = gl.nondet.web.get(self.flight_api_url + flight)
        board = gl.nondet.web.render(f"https://flightaware.com/live/airport/{flight[:3]}")
        prompt = (
            f"API data: {data[:800]}\\n\\nIs flight {flight} delayed? "
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
  task: "Implement `batch_pay_claims()` (insurer-only): iterate the `holders` DynArray, skip any address with no policy or non-CLAIMED status, raise if pool is exhausted, and pay each valid claim via `gl.send` marking it `PAID`.",
  hints: [
    "Start with the insurer guard, then `for holder in holders:` — iterate directly over the DynArray.",
    "Use `continue` (not `raise`) when a policy is missing or not CLAIMED — the list may have stale entries that were already paid.",
    "`gl.send(holder, policy.coverage); self.pool_balance -= policy.coverage; policy.status = PAID; self.policies[holder] = policy` — same logic as `pay_out_claim` but inside the loop.",
  ],
};

export default content;
