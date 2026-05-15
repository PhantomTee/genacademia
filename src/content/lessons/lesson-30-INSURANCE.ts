import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 30,
  projectPath: "INSURANCE",
  explanation: `## Lesson 30 — FINAL CAPSTONE: Ship CaseWise

You have built CaseWise from a blank contract to a production-grade flight delay insurance pool. This final lesson adds \`get_pool_summary()\` — the dashboard endpoint that any front-end, wallet, or analytics tool will call to get an at-a-glance snapshot of the pool's state.

\`\`\`python
@gl.public.view
def get_pool_summary(self) -> dict:
    return {
        "pool_name": self.pool_name,
        "insurer": str(self.insurer),        # Address → str for JSON
        "holder_count": self.holder_count,
        "pool_balance": int(self.pool_balance),  # u256 → int for JSON
        "version": self.version,
    }
\`\`\`

Type coercions matter for JSON-safe return values:
- \`Address\` must be wrapped in \`str()\` — it serialises to the hex string \`"0xabc..."\`.
- \`u256\` must be wrapped in \`int()\` — raw \`u256\` objects are not JSON-serialisable.
- \`str\` and \`int\` fields need no conversion.

With \`get_pool_summary\` live, your contract exposes everything an insurer dashboard needs: the pool identity, who controls it, how many policyholders are enrolled, what the current balance is, and which version of the verifier is active.

**CaseWise now has:**
- Policyholder enrolment with premium collection (L21)
- Structured \`Policy\` records in a \`TreeMap\` (L12)
- Four-state claim lifecycle (L14)
- AI-powered delay verification with visual analysis (L20)
- Semantic incident search (L23)
- Weather oracle integration (L24)
- Batch payouts (L25), randomised audits (L26), upgradable verifier (L27)
- Full debug logging (L28) and special message handlers (L29)

Ship it.`,
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
    accepting_enrollments: bool

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
        self.accepting_enrollments = True

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.view
    def get_pool_summary(self) -> dict:
        pass  # TODO: return dict with pool_name, insurer (str), holder_count, pool_balance (int), version

    @gl.public.write.payable
    def enroll(self, flight_number: str) -> None:
        if not self.accepting_enrollments:
            raise gl.vm.UserError("pool is paused")
        premium = gl.message.value
        if premium < 10**15:
            raise gl.vm.UserError("premium too low")
        sender = gl.message.sender_address
        gl.emit_debug(f"[enroll] sender={sender} flight={flight_number} premium={premium}")
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
        gl.emit_debug(f"[file_claim] sender={sender} flight={policy.flight_number} audited={audited}")

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
        gl.emit_debug(f"[pay_out_claim] holder={holder} coverage={int(policy.coverage)} pool_after={int(self.pool_balance) - int(policy.coverage)}")
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

    def __receive_value__(self, amount: u256) -> None:
        self.pool_balance += amount

    def __receive_message__(self, message: str) -> None:
        if message == "pause":
            if gl.message.sender_address != self.insurer:
                raise gl.vm.UserError("unauthorized")
            self.accepting_enrollments = False

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
  task: "Implement `get_pool_summary()` to return a dict with keys `pool_name` (str), `insurer` (str), `holder_count` (int), `pool_balance` (int), and `version` (int). Use `str()` for `Address` values and `int()` for `u256` values.",
  hints: [
    "All five keys are required — the dashboard will break if any are missing. Return a plain Python dict literal.",
    "`\"insurer\": str(self.insurer)` — wrap `Address` in `str()` to get the hex string `\"0xabc...\"` that JSON can serialise.",
    "`return {\"pool_name\": self.pool_name, \"insurer\": str(self.insurer), \"holder_count\": self.holder_count, \"pool_balance\": int(self.pool_balance), \"version\": self.version}`",
  ],
};

export default content;
