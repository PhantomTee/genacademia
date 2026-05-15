import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 28,
  projectPath: "INSURANCE",
  explanation: `## Lesson 28 — Debugging: emit_debug

GenLayer Studio shows \`gl.emit_debug\` messages in real time during local development. They appear in the transaction log alongside gas usage and state changes. Unlike \`print()\`, which is silently dropped in production, \`emit_debug\` is a first-class contract primitive — but its output is stripped from mainnet execution so it adds zero overhead in production.

\`\`\`python
@gl.public.write.payable
def enroll(self, flight_number: str) -> None:
    premium = gl.message.value
    gl.emit_debug(f"[enroll] sender={gl.message.sender_address} flight={flight_number} premium={premium}")
    ...
\`\`\`

Useful patterns:

- **Enrolment**: log sender address, flight number, and premium amount.
- **Claim filing**: log flight number, claim reason, and whether audit was triggered.
- **Payout**: log holder address, coverage amount sent, and remaining pool balance.

\`\`\`python
@gl.public.write
def pay_out_claim(self, holder: Address) -> None:
    ...
    gl.emit_debug(
        f"[pay_out_claim] holder={holder} coverage={policy.coverage} "
        f"pool_after={int(self.pool_balance) - int(policy.coverage)}"
    )
    gl.send(holder, policy.coverage)
    ...
\`\`\`

Best practice: prefix messages with the method name in brackets so log lines are easy to filter. Include amounts and addresses that would help you diagnose a failed transaction.

After adding debug logs, you can replay any transaction in Studio and see exactly what happened at each step — invaluable for tracking down off-by-one errors in coverage calculations or unexpected state machine transitions.`,
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
    audit_queue: DynArray[Address]
    verifier_contract: Address
    version: int

    def __init__(self, pool_name: str, flight_api_url: str, weather_oracle: Address) -> None:
        self.pool_name = pool_name
        self.insurer = gl.message.sender_address
        self.holder_count = 0
        self.flight_api_url = flight_api_url
        self.policies = TreeMap[Address, Policy]()
        self.pool_balance = u256(0)
        self.incident_index = gl.VectorStorage()
        self.weather_oracle = weather_oracle
        self.audit_queue = DynArray[Address]()
        self.verifier_contract = Address("0x0000000000000000000000000000000000000000")
        self.version = 0

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.write.payable
    def enroll(self, flight_number: str) -> None:
        # TODO: add gl.emit_debug log here
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
        audited = self.select_for_audit()
        if audited:
            self.audit_queue.append(sender)
        # TODO: add gl.emit_debug log here (include flight, sender, audited)

    def select_for_audit(self) -> bool:
        return gl.get_random_u8() < 26

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
        # TODO: add gl.emit_debug log here (include holder, coverage, pool balance after)
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
        if gl.message.sender_address != self.insurer:
            raise gl.vm.UserError("unauthorized")
        for holder in holders:
            policy = self.policies.get(holder, None)
            if policy is None:
                continue
            if policy.status != CLAIMED:
                continue
            if int(self.pool_balance) < int(policy.coverage):
                raise gl.vm.UserError("pool exhausted")
            gl.send(holder, policy.coverage)
            self.pool_balance -= policy.coverage
            policy.status = PAID
            self.policies[holder] = policy

    @gl.public.write
    def update_verifier(self, new_verifier: Address) -> None:
        if gl.message.sender_address != self.insurer:
            raise gl.vm.UserError("unauthorized")
        if new_verifier == Address("0x0000000000000000000000000000000000000000"):
            raise gl.vm.UserError("zero address")
        self.verifier_contract = new_verifier
        self.version += 1

    @gl.public.view
    def get_version(self) -> int:
        return self.version

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
  task: "Add `gl.emit_debug(...)` calls to `enroll()`, `file_claim()`, and `pay_out_claim()`. Each log should include the method name and the key values involved (addresses, flight numbers, amounts, audit flag).",
  hints: [
    "`gl.emit_debug(f\"[enroll] sender={gl.message.sender_address} flight={flight_number} premium={premium}\")` — put it before the minimum-premium check so you can see attempted enrollments.",
    "In `file_claim()`: `gl.emit_debug(f\"[file_claim] sender={sender} flight={policy.flight_number} audited={audited}\")` — log after the audit check so you know whether they were selected.",
    "In `pay_out_claim()` before `gl.send`: `gl.emit_debug(f\"[pay_out_claim] holder={holder} coverage={int(policy.coverage)} pool_after={int(self.pool_balance) - int(policy.coverage)}\")` — log projected balance, not actual, since the send hasn't happened yet.",
  ],
};

export default content;
