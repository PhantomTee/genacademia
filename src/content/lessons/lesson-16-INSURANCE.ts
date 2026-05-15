import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 16,
  projectPath: "INSURANCE",
  explanation: `## Lesson 16 — run_nondet_unsafe

GenLayer's consensus model runs every non-deterministic call on multiple validator nodes. By default, validators compare results with strict equality — two nodes must return the exact same string. Flight delay data is fetched live from the internet, so slight differences in wording can cause validators to disagree even when both answers are correct.

\`gl.vm.run_nondet_unsafe(leader_fn, validator_fn)\` lets you supply your own equivalence check. The leader node runs \`leader_fn\` and produces a result; each validator runs \`validator_fn(result)\` and returns \`True\` if it considers the result acceptable.

\`\`\`python
def _leader_verify(self, flight: str) -> dict:
    data = gl.nondet.web.get(self.flight_api_url + flight)
    prompt = (
        f"Flight data: {data[:1500]}\\n\\n"
        f"Is flight {flight} delayed? "
        'Respond with JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer}'
    )
    return gl.nondet.exec_prompt(prompt, response_format="json")

def _validate_verify(self, r) -> bool:
    return (
        isinstance(r, dict)
        and "delay_minutes" in r
        and "status" in r
    )

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
\`\`\`

The validator never re-fetches the flight data — it only checks whether the structure returned by the leader is plausible. This separation of roles is the key insight: **leaders produce, validators verify**.`,
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
        pass  # TODO: fetch flight data + exec_prompt JSON {status, delay_minutes}

    def _validate_verify(self, r) -> bool:
        pass  # TODO: check result has required keys

    @gl.public.write
    def verify_delay(self, holder: Address) -> str:
        policy = self.policies.get(holder, None)
        if policy is None:
            raise gl.vm.UserError("no policy found")
        # TODO: replace this with run_nondet_unsafe using _leader_verify + _validate_verify
        data = gl.nondet.web.get(self.flight_api_url + policy.flight_number)
        prompt = (
            f"Flight data: {data[:1500]}\\n\\n"
            f"Is flight {policy.flight_number} delayed? "
            'Respond with JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer}'
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        return result["status"]
`,
  task: "Implement `_leader_verify()` to fetch flight data and call `exec_prompt` returning JSON with `status` and `delay_minutes`. Implement `_validate_verify()` to check the result has both keys. Use `gl.vm.run_nondet_unsafe` in `verify_delay()`.",
  hints: [
    "Leader: `data = gl.nondet.web.get(self.flight_api_url + flight)` then `return gl.nondet.exec_prompt(prompt, response_format=\"json\")` where prompt asks for `{\"status\": ..., \"delay_minutes\": ...}`.",
    "Validator: `return isinstance(r, dict) and \"delay_minutes\" in r and \"status\" in r` — just check structure, no re-fetching.",
    "`result = gl.vm.run_nondet_unsafe(lambda: self._leader_verify(policy.flight_number), lambda r: self._validate_verify(r)); return result[\"status\"]`",
  ],
};

export default content;
