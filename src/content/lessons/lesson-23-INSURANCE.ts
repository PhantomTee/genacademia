import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 23,
  projectPath: "INSURANCE",
  explanation: `## Lesson 23 — VectorStorage: Incident Reports

Claims contain free-text delay reasons — "engine fault", "severe weather", "crew rest violation". A \`TreeMap\` can store them, but it cannot answer "find all weather-related claims". \`gl.VectorStorage\` adds semantic search: it converts text into embedding vectors and finds the nearest neighbours by meaning.

\`\`\`python
class InsurancePool(gl.Contract):
    incident_index: gl.VectorStorage

    def __init__(self, ...) -> None:
        ...
        self.incident_index = gl.VectorStorage()
\`\`\`

Adding an entry in \`file_claim()\`:

\`\`\`python
self.incident_index.add(
    reason,
    {"flight": policy.flight_number, "holder": str(sender)},
)
\`\`\`

The first argument is the text that gets embedded. The second is a metadata dict attached to each result.

Searching:

\`\`\`python
@gl.public.view
def search_incidents(self, query: str) -> list:
    return self.incident_index.search(query, top_k=5)
\`\`\`

\`search\` returns a list of metadata dicts sorted by semantic similarity. An insurer can now query "weather delay claims" and retrieve all incidents whose reason text is semantically close to that phrase — even if the exact words differ.

VectorStorage is ideal for evidence logs, audit trails, and any free-text data you want to query by meaning rather than exact key lookup.`,
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

    def __init__(self, pool_name: str, flight_api_url: str) -> None:
        self.pool_name = pool_name
        self.insurer = gl.message.sender_address
        self.holder_count = 0
        self.flight_api_url = flight_api_url
        self.policies = TreeMap[Address, Policy]()
        self.pool_balance = u256(0)
        # TODO: initialise self.incident_index as gl.VectorStorage()

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
        # TODO: add reason to self.incident_index with metadata {flight, holder}

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
        pass  # TODO: search incident_index for top 5 results

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
  task: "Initialise `self.incident_index = gl.VectorStorage()` in `__init__`. In `file_claim()`, add the `reason` text to the index with metadata `{\"flight\": ..., \"holder\": ...}`. Implement `search_incidents()` to return the top 5 semantically similar incidents.",
  hints: [
    "In `__init__`: `self.incident_index = gl.VectorStorage()` — same pattern as initialising a TreeMap.",
    "In `file_claim()` after updating status: `self.incident_index.add(reason, {\"flight\": policy.flight_number, \"holder\": str(sender)})`.",
    "`return self.incident_index.search(query, top_k=5)` — returns a list of the metadata dicts whose text embeddings are closest to the query.",
  ],
};

export default content;
