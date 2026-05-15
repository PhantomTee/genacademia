import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 24,
  projectPath: "INSURANCE",
  explanation: `## Lesson 24 — Contract-to-Contract: Weather Oracle

CaseWise verifies delays using public flight APIs, but extreme weather events often cause cascading delays that are better explained by meteorological data. Rather than bundle weather logic directly into InsurancePool, we call a separate on-chain weather oracle contract.

\`gl.call_contract(address, method, args)\` invokes any deployed contract:

\`\`\`python
result = gl.call_contract(
    self.weather_oracle,     # Address of the oracle contract
    "get_flight_weather",    # Method name as string
    [flight],                # List of positional arguments
)
\`\`\`

The return value is whatever the oracle's method returns, cast to the appropriate Python type with \`str()\` or \`int()\`.

\`\`\`python
@gl.public.write
def get_weather_data(self, flight: str) -> str:
    return str(gl.call_contract(self.weather_oracle, "get_flight_weather", [flight]))
\`\`\`

Benefits of this pattern:
- **Separation of concerns**: weather logic lives in its own auditable contract.
- **Upgradability**: swap out the oracle address without redeploying InsurancePool (see Lesson 27).
- **Shared infrastructure**: multiple insurance pools can use the same oracle.

Store the oracle address in the constructor so the insurer can configure it at deploy time. Validate that it is non-zero before calling, or the VM will raise an error at the \`call_contract\` site.`,
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
        pass  # TODO: call self.weather_oracle with method "get_flight_weather" and [flight]

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
  task: "Implement `get_weather_data()` by calling `self.weather_oracle` with method `\"get_flight_weather\"` and the flight number as argument. Return the result as a string.",
  hints: [
    "`gl.call_contract(address, method_name, args_list)` — the third argument is a Python list of positional arguments.",
    "`return str(gl.call_contract(self.weather_oracle, \"get_flight_weather\", [flight]))` — wrap in `str()` to ensure the return type matches the annotation.",
    "If `self.weather_oracle` is the zero address, the call will fail at runtime. Add a guard: `if self.weather_oracle == Address(\"0x0000000000000000000000000000000000000000\"): raise gl.vm.UserError(\"oracle not set\")`.",
  ],
};

export default content;
