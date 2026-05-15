import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "INSURANCE",
  explanation: `## Lesson 15 — CAPSTONE: Data Structures

You have built the full CaseWise data model: \`TreeMap\` for policies, the \`Policy\` dataclass, ownership via \`Address\`, and a four-state claim machine. This capstone pulls it all together by adding two view functions that external clients (dashboards, wallets) will call constantly.

**\`get_claim_status(holder)\`** returns a single string — the policy's current \`status\` field. The caller must be enrolled; return a helpful error otherwise.

\`\`\`python
@gl.public.view
def get_claim_status(self, holder: Address) -> str:
    policy = self.policies.get(holder, None)
    if policy is None:
        raise gl.vm.UserError("not enrolled")
    return policy.status
\`\`\`

**\`get_pool_stats()\`** returns a snapshot of the whole pool. For now it needs two keys:

\`\`\`python
@gl.public.view
def get_pool_stats(self) -> dict:
    return {
        "holder_count": self.holder_count,
        "pool_balance": 0,   # will be replaced in Lesson 21
    }
\`\`\`

Returning plain Python dicts from view functions is idiomatic in GenLayer — the values are automatically serialised to JSON for external callers. Use \`int()\` for \`u256\` fields to keep them JSON-safe.

After this lesson you have a fully queryable insurance pool on-chain. Lessons 16–20 upgrade the off-chain verification engine with custom equivalence checks and multi-modal AI.`,
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
    def transfer_insurer(self, new_insurer: Address) -> None:
        if gl.message.sender_address != self.insurer:
            raise gl.vm.UserError("unauthorized")
        if new_insurer == Address("0x0000000000000000000000000000000000000000"):
            raise gl.vm.UserError("zero address")
        self.insurer = new_insurer

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
        pass  # TODO: return the holder's policy status, raise if not enrolled

    @gl.public.view
    def get_pool_stats(self) -> dict:
        pass  # TODO: return dict with holder_count and pool_balance

    @gl.public.view
    def get_policy_details(self, holder: Address) -> dict:
        policy = self.policies.get(holder, None)
        if policy is None:
            raise gl.vm.UserError("not enrolled")
        return {
            "holder": str(policy.holder),
            "flight_number": policy.flight_number,
            "premium": int(policy.premium),
            "coverage": int(policy.coverage),
            "status": policy.status,
        }

    @gl.public.write
    def verify_delay(self, holder: Address) -> str:
        policy = self.policies.get(holder, None)
        if policy is None:
            raise gl.vm.UserError("no policy found")
        data = gl.nondet.web.get(self.flight_api_url + policy.flight_number)
        prompt = (
            f"Flight data: {data[:1500]}\\n\\n"
            f"Is flight {policy.flight_number} delayed by more than 30 minutes? "
            'Respond with JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer}'
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        return result["status"]
`,
  task: "Implement `get_claim_status()` to return the holder's policy status (raise `UserError` if not enrolled). Implement `get_pool_stats()` to return a dict with `holder_count` and `pool_balance` keys.",
  hints: [
    "In `get_claim_status()`: `policy = self.policies.get(holder, None); if policy is None: raise gl.vm.UserError(\"not enrolled\"); return policy.status`.",
    "`get_pool_stats()` returns a plain dict — use `self.holder_count` for the count and `0` as a placeholder for `pool_balance` (it becomes real in Lesson 21).",
    "`return {\"holder_count\": self.holder_count, \"pool_balance\": 0}` — both keys must be present; the front-end dashboard expects exactly this shape.",
  ],
};

export default content;
