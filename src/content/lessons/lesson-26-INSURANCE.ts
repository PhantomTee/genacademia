import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 26,
  projectPath: "INSURANCE",
  explanation: `## Lesson 26 — Randomness: Audit Selection

Insurers audit a sample of claims to detect fraud. Auditing every claim is too expensive; auditing none is negligent. \`gl.get_random_u8()\` returns a cryptographically random integer in \`[0, 255]\` that is agreed upon by all consensus validators.

\`\`\`python
def select_for_audit(self) -> bool:
    return gl.get_random_u8() < 26   # 26/256 ≈ 10%
\`\`\`

26 out of 256 possible values gives ~10.16% selection probability. Adjust the threshold to change the rate — \`13\` for ~5%, \`51\` for ~20%.

Call \`select_for_audit\` inside \`file_claim\` and track selected addresses in an \`audit_queue\`:

\`\`\`python
@gl.public.write
def file_claim(self, reason: str) -> None:
    ...
    if self.select_for_audit():
        self.audit_queue.append(sender)
\`\`\`

\`audit_queue\` is a \`DynArray[Address]\` — a resizable list that the insurer can iterate to process audits. The insurer reads it, audits each claim off-chain (flight records, receipts), then calls \`pay_out_claim\` or \`deny_claim\` based on findings.

GenLayer's randomness is consensus-safe: the random seed is derived from block metadata that all validators agree on, so every validator will compute the same \`True\` or \`False\` for a given claim.`,
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
        # TODO: call select_for_audit() and append sender to audit_queue if selected

    def select_for_audit(self) -> bool:
        pass  # TODO: return True ~10% of the time using gl.get_random_u8() < 26

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
  task: "Implement `select_for_audit()` to return `True` approximately 10% of the time using `gl.get_random_u8() < 26`. Call it inside `file_claim()` and append the sender to `self.audit_queue` if selected.",
  hints: [
    "`gl.get_random_u8()` returns a value in `[0, 255]`. Comparing it to `26` gives 26/256 ≈ 10.16% true rate.",
    "`def select_for_audit(self) -> bool: return gl.get_random_u8() < 26`",
    "In `file_claim()` after updating status and adding to incident_index: `if self.select_for_audit(): self.audit_queue.append(sender)`",
  ],
};

export default content;
