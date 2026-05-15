import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 11,
  projectPath: "INSURANCE",
  explanation: `## Lesson 11 — TreeMap & DynArray

CaseWise currently tracks the number of enrolled policyholders with a single \`holder_count\` integer. That tells us *how many* people enrolled, but not *who* enrolled or *which flight* they insured. To pay out claims, we need a mapping from address to flight number.

\`TreeMap[K, V]\` is GenLayer's persistent key-value store. It survives across contract calls and supports any on-chain key type, including \`Address\`.

\`\`\`python
from genlayer.types import Address, TreeMap

class InsurancePool(gl.Contract):
    policies: TreeMap[Address, str]

    def __init__(self, ...) -> None:
        self.policies = TreeMap[Address, str]()

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        self.policies[gl.message.sender_address] = flight_number
        self.holder_count += 1
\`\`\`

Use \`.get(key, default)\` for safe reads — if an address has no policy the call returns the default instead of raising a \`KeyError\`:

\`\`\`python
@gl.public.view
def get_policy(self, holder: Address) -> str:
    return self.policies.get(holder, "NOT_ENROLLED")
\`\`\`

\`DynArray[T]\` works like a resizable list with \`append()\` and index access. You will use it in later lessons to iterate over holders during batch payouts. For now, focus on getting the \`TreeMap\` wired up correctly so every enrolment is permanently recorded on-chain.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap


class InsurancePool(gl.Contract):
    pool_name: str
    insurer: Address
    holder_count: int
    flight_api_url: str
    policies: TreeMap[Address, str]

    def __init__(self, pool_name: str, flight_api_url: str) -> None:
        self.pool_name = pool_name
        self.insurer = gl.message.sender_address
        self.holder_count = 0
        self.flight_api_url = flight_api_url
        # TODO: initialise self.policies as TreeMap[Address, str]()

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        self.holder_count += 1
        # TODO: store flight_number in self.policies keyed by sender address

    @gl.public.view
    def get_holder_count(self) -> int:
        return self.holder_count

    @gl.public.view
    def get_policy(self, holder: Address) -> str:
        pass  # TODO: return flight number using .get() with "NOT_ENROLLED" default

    @gl.public.write
    def verify_delay(self, holder: Address) -> str:
        flight = self.policies.get(holder, "")
        if not flight:
            raise gl.vm.UserError("no policy found")
        data = gl.nondet.web.get(self.flight_api_url + flight)
        prompt = (
            f"Flight data: {data[:1500]}\\n\\n"
            f"Is flight {flight} delayed by more than 30 minutes? "
            'Respond with JSON: {"status": "DELAYED or ON_TIME", "delay_minutes": integer}'
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        return result["status"]
`,
  task: "Initialise `self.policies` as a `TreeMap[Address, str]()` in `__init__`, update `enroll()` to store the flight number keyed by the caller's address, and implement `get_policy()` to return the flight number safely.",
  hints: [
    "Declare `policies: TreeMap[Address, str]` as a class annotation, then in `__init__` write `self.policies = TreeMap[Address, str]()`.",
    "Inside `enroll()`, add `self.policies[gl.message.sender_address] = flight_number` after incrementing `holder_count`.",
    "`return self.policies.get(holder, \"NOT_ENROLLED\")` — the `.get()` method takes a key and a default value, so missing addresses return `\"NOT_ENROLLED\"` instead of raising an error.",
  ],
};

export default content;
