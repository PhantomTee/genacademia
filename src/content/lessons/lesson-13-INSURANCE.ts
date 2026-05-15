import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "INSURANCE",
  explanation: `## Lesson 13 — Address & Ownership

CaseWise holds real funds and writes binding policy records. Only the insurer who deployed the pool should be able to transfer that authority to someone else — and even then only to a valid (non-zero) address.

GenLayer exposes the caller's address as \`gl.message.sender_address\`. Comparing it to \`self.insurer\` is the standard ownership check:

\`\`\`python
@gl.public.write
def transfer_insurer(self, new_insurer: Address) -> None:
    if gl.message.sender_address != self.insurer:
        raise gl.vm.UserError("unauthorized")
    if new_insurer == Address("0x0000000000000000000000000000000000000000"):
        raise gl.vm.UserError("zero address")
    self.insurer = new_insurer
\`\`\`

Two guards are needed:

1. **Caller check** — only the current \`self.insurer\` can call this method. Anyone else gets a \`UserError\`.
2. **Zero-address check** — transferring to the zero address would permanently lock the contract with no owner. GenLayer represents the zero address as \`Address("0x0000...0000")\`.

After both checks pass, update \`self.insurer = new_insurer\`. The old insurer immediately loses all privileged access — future ownership checks will now compare against the new address.

This same pattern — modifier-style guard at the top of a function — appears throughout Lessons 14, 22, and 25 wherever insurer-only operations are needed.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


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

    @gl.public.view
    def get_insurer(self) -> str:
        return str(self.insurer)

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        sender = gl.message.sender_address
        policy = Policy(holder=sender, flight_number=flight_number, premium=0, coverage=0)
        self.policies[sender] = policy
        self.holder_count += 1

    @gl.public.write
    def transfer_insurer(self, new_insurer: Address) -> None:
        pass  # TODO: check caller is insurer, reject zero address, then assign

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
  task: "Implement `transfer_insurer()` so that only the current insurer can transfer ownership to a new non-zero address. Reject unauthorized callers and the zero address with a `UserError`.",
  hints: [
    "Start with the authorization guard: `if gl.message.sender_address != self.insurer: raise gl.vm.UserError(\"unauthorized\")`.",
    "Then reject the zero address: `if new_insurer == Address(\"0x0000000000000000000000000000000000000000\"): raise gl.vm.UserError(\"zero address\")`.",
    "Finally assign: `self.insurer = new_insurer` — after this line the old insurer loses all privileged access immediately.",
  ],
};

export default content;
