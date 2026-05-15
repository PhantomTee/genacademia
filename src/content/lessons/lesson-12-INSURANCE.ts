import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "INSURANCE",
  explanation: `## Lesson 12 — Dataclasses as On-Chain Records

Storing just a flight number string works, but CaseWise also needs to know the premium paid, the coverage amount, and the current claim status for each policyholder. Python's \`@dataclass\` decorator lets us bundle all of that into a single structured record that GenLayer can persist on-chain.

\`\`\`python
from dataclasses import dataclass
from genlayer.types import Address, u256

@dataclass
class Policy:
    holder: Address
    flight_number: str
    premium: u256
    coverage: u256
    status: str = "ACTIVE"
\`\`\`

The \`@dataclass\` decorator auto-generates \`__init__\`, \`__repr__\`, and \`__eq__\`. GenLayer serialises these to on-chain storage automatically. Update the \`TreeMap\` type parameter to \`TreeMap[Address, Policy]\`:

\`\`\`python
class InsurancePool(gl.Contract):
    policies: TreeMap[Address, Policy]

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        sender = gl.message.sender_address
        policy = Policy(
            holder=sender,
            flight_number=flight_number,
            premium=0,    # will be replaced with gl.message.value in Lesson 21
            coverage=0,
            status="ACTIVE",
        )
        self.policies[sender] = policy
        self.holder_count += 1
\`\`\`

To return policy data through the public ABI, convert the dataclass to a plain \`dict\`. This keeps the return type JSON-compatible for front-end clients.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


@dataclass
class Policy:
    pass  # TODO: add fields: holder: Address, flight_number: str, premium: u256, coverage: u256, status: str = "ACTIVE"


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
        # TODO: create a Policy and store it in self.policies[sender]
        self.holder_count += 1

    @gl.public.view
    def get_holder_count(self) -> int:
        return self.holder_count

    @gl.public.view
    def get_policy_details(self, holder: Address) -> dict:
        pass  # TODO: return dict of policy fields, or raise if not found

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
  task: "Complete the `Policy` dataclass with fields `holder`, `flight_number`, `premium`, `coverage`, and `status`. Update `enroll()` to create and store a `Policy`. Implement `get_policy_details()` to return a dict of the policy's fields.",
  hints: [
    "Add type-annotated fields to `Policy`: `holder: Address`, `flight_number: str`, `premium: u256`, `coverage: u256`, `status: str = \"ACTIVE\"` — the default value goes after the type annotation.",
    "In `enroll()`: `policy = Policy(holder=sender, flight_number=flight_number, premium=0, coverage=0)` then `self.policies[sender] = policy`.",
    "In `get_policy_details()`: `policy = self.policies.get(holder, None); if policy is None: raise gl.vm.UserError(\"not enrolled\"); return {\"holder\": str(policy.holder), \"flight_number\": policy.flight_number, \"premium\": int(policy.premium), \"coverage\": int(policy.coverage), \"status\": policy.status}`",
  ],
};

export default content;
