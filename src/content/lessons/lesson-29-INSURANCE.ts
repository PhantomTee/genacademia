import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 29,
  projectPath: "INSURANCE",
  explanation: `## Lesson 29 — Special Methods

GenLayer contracts can respond to two special incoming message types without requiring a named public method call:

**\`__receive_value__(self, amount: u256)\`** — called whenever GEN is sent directly to the contract address (without calling a named method). This lets the pool accept top-up deposits from the insurer:

\`\`\`python
def __receive_value__(self, amount: u256) -> None:
    self.pool_balance += amount
    gl.emit_debug(f"[receive_value] top-up {amount} wei, pool={int(self.pool_balance)}")
\`\`\`

**\`__receive_message__(self, message: str)\`** — called when a raw string message is sent to the contract. CaseWise uses this for a simple admin command channel:

\`\`\`python
def __receive_message__(self, message: str) -> None:
    if message == "pause":
        if gl.message.sender_address != self.insurer:
            raise gl.vm.UserError("unauthorized")
        self.accepting_enrollments = False
        gl.emit_debug("[receive_message] pool paused")
\`\`\`

Note that \`__receive_message__\` is called for any string message, so guard commands with an insurer check. Unknown commands should be silently ignored — do not raise on unrecognised strings as that would break future message-based extensions.

These methods make the contract composable: other contracts or wallets can top up the pool balance or trigger admin actions without the insurer needing to know the exact ABI method name at deployment time.`,
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
        pass  # TODO: add amount to pool_balance

    def __receive_message__(self, message: str) -> None:
        pass  # TODO: handle "pause" command (insurer only → accepting_enrollments = False)

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
  task: "Implement `__receive_value__` to add the received GEN amount to `self.pool_balance`. Implement `__receive_message__` to handle the `\"pause\"` command (insurer-only): set `self.accepting_enrollments = False`. Silently ignore unknown commands.",
  hints: [
    "`def __receive_value__(self, amount: u256) -> None: self.pool_balance += amount` — the amount is already received by the contract; you just mirror it in state.",
    "In `__receive_message__`, use `if message == \"pause\":` — only handle the exact string. Fall through silently for anything else.",
    "`if message == \"pause\": if gl.message.sender_address != self.insurer: raise gl.vm.UserError(\"unauthorized\"); self.accepting_enrollments = False`",
  ],
};

export default content;
