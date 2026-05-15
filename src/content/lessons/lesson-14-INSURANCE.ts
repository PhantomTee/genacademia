import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 14,
  projectPath: "INSURANCE",
  explanation: `## Lesson 14 — State Machines

Insurance claims follow a strict lifecycle: a policy starts \`ACTIVE\`, becomes \`CLAIMED\` when the holder files, and finally resolves as \`PAID\` or \`DENIED\` after the insurer reviews it. Modelling this as a state machine prevents illegal transitions — a holder cannot file the same claim twice, and the insurer cannot pay before a claim is filed.

The pattern is: **check the current status before allowing any transition**.

\`\`\`python
@gl.public.write
def file_claim(self) -> None:
    sender = gl.message.sender_address
    policy = self.policies.get(sender, None)
    if policy is None:
        raise gl.vm.UserError("not enrolled")
    if policy.status != "ACTIVE":
        raise gl.vm.UserError("already claimed")
    policy.status = "CLAIMED"
    self.policies[sender] = policy   # write back!
\`\`\`

Notice the write-back: mutating a local \`policy\` variable without reassigning it to \`self.policies[sender]\` does **not** persist the change on-chain. Always write the updated record back to the \`TreeMap\`.

The insurer controls terminal transitions. Both \`pay_claim\` and \`deny_claim\` need two guards:
1. Caller must be the insurer.
2. Policy must currently be \`CLAIMED\` — not \`ACTIVE\`, and not already \`PAID\` or \`DENIED\`.

\`\`\`python
@gl.public.write
def pay_claim(self, holder: Address) -> None:
    if gl.message.sender_address != self.insurer:
        raise gl.vm.UserError("unauthorized")
    policy = self.policies[holder]
    if policy.status != "CLAIMED":
        raise gl.vm.UserError("not in CLAIMED state")
    policy.status = "PAID"
    self.policies[holder] = policy
\`\`\``,
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
        pass  # TODO: transition caller's policy ACTIVE → CLAIMED

    @gl.public.write
    def pay_claim(self, holder: Address) -> None:
        pass  # TODO: insurer only — transition CLAIMED → PAID

    @gl.public.write
    def deny_claim(self, holder: Address) -> None:
        pass  # TODO: insurer only — transition CLAIMED → DENIED

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
  task: "Implement `file_claim()` to transition the caller's policy from `ACTIVE` to `CLAIMED`. Implement `pay_claim()` and `deny_claim()` — both insurer-only — to transition a holder's policy from `CLAIMED` to `PAID` or `DENIED` respectively.",
  hints: [
    "In `file_claim()`: fetch with `.get()`, check `policy.status != ACTIVE` and raise `UserError(\"already claimed\")`, then set `policy.status = CLAIMED` and write back with `self.policies[sender] = policy`.",
    "Both `pay_claim` and `deny_claim` need two guards at the top: `if gl.message.sender_address != self.insurer: raise ...` then `if policy.status != CLAIMED: raise ...`.",
    "`def deny_claim(self, holder): if gl.message.sender_address != self.insurer: raise gl.vm.UserError(\"unauthorized\"); policy = self.policies[holder]; if policy.status != CLAIMED: raise gl.vm.UserError(\"not in CLAIMED state\"); policy.status = DENIED; self.policies[holder] = policy`",
  ],
};

export default content;
