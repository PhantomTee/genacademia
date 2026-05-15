import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 23,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 23 — VectorStorage: Semantic Search for Freelancers

Finding the right freelancer by scanning every bio is expensive and imprecise. GenLayer's **VectorStorage** lets you index text and retrieve the most semantically similar entries — like a built-in embedding database inside your contract.

### Declaring and Initialising VectorStorage

\`\`\`python
class FreelanceEscrow(gl.Contract):
    profile_index: gl.VectorStorage
    ...

    def __init__(self, title: str, budget: u256) -> None:
        ...
        self.profile_index = gl.VectorStorage()
\`\`\`

### Indexing a Bio

Call \`.add(text, metadata)\` when a freelancer applies. The metadata dict can store any JSON-serialisable data you want back at query time.

\`\`\`python
self.profile_index.add(bio, {"applicant": str(addr)})
\`\`\`

### Querying with Semantic Search

\`\`\`python
results = self.profile_index.search(query, top_k=5)
# results: list of (score, metadata_dict)
\`\`\`

Each result is a \`(similarity_score, metadata)\` tuple. Higher score means more relevant. Return the metadata dicts for the top matches:

\`\`\`python
return [r[1] for r in results]
\`\`\`

### Why This Is Powerful

Traditional smart contracts can only do exact key lookups. With VectorStorage, a client can search "experienced React developer with open-source contributions" and instantly surface the most relevant applicants — all on-chain, with AI-grade semantic matching.

### Integration Point

Add the \`.add()\` call inside \`apply()\` right after storing the Application so every new applicant is automatically indexed.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass

OPEN = "OPEN"
AWARDED = "AWARDED"
WORK_SUBMITTED = "WORK_SUBMITTED"
COMPLETE = "COMPLETE"
DISPUTED = "DISPUTED"


@dataclass
class Application:
    bio: str
    portfolio_url: str
    score: int = 0
    approved: bool = False


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    escrow_amount: u256
    is_open: bool
    status: str
    applicant_count: int
    applications: TreeMap[Address, Application]
    awarded_to: Address
    deliverable_url: str
    profile_index: gl.VectorStorage

    def __init__(self, title: str, budget: u256) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.escrow_amount = u256(0)
        self.is_open = True
        self.status = OPEN
        self.applicant_count = 0
        self.applications = TreeMap[Address, Application]()
        self.awarded_to = Address("0x0000000000000000000000000000000000000000")
        self.deliverable_url = ""
        # TODO: initialise self.profile_index

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.view
    def get_escrow_amount(self) -> int:
        return int(self.escrow_amount)

    @gl.public.write.payable
    def fund_escrow(self) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can fund")
        self.escrow_amount += gl.message.value

    @gl.public.write
    def apply(self, bio: str, portfolio_url: str) -> None:
        if self.status != OPEN:
            raise gl.vm.UserError("job is not open")
        addr = gl.message.sender_address
        if self.applications.get(addr, None) is not None:
            raise gl.vm.UserError("already applied")
        self.applications[addr] = Application(bio=bio, portfolio_url=portfolio_url)
        self.applicant_count += 1
        # TODO: index the bio in profile_index with metadata {"applicant": str(addr)}

    @gl.public.write
    def award_job(self, freelancer: Address) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can award")
        if self.status != OPEN:
            raise gl.vm.UserError("job is not open")
        if self.applications.get(freelancer, None) is None:
            raise gl.vm.UserError("applicant not found")
        self.awarded_to = freelancer
        self.status = AWARDED

    @gl.public.write
    def submit_work(self, deliverable_url: str) -> None:
        if gl.message.sender_address != self.awarded_to:
            raise gl.vm.UserError("only awarded freelancer can submit")
        if self.status != AWARDED:
            raise gl.vm.UserError("job is not awarded")
        self.deliverable_url = deliverable_url
        self.status = WORK_SUBMITTED

    @gl.public.write
    def approve_work(self) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can approve")
        if self.status != WORK_SUBMITTED:
            raise gl.vm.UserError("work has not been submitted")
        self.status = COMPLETE

    @gl.public.write
    def release_payment(self) -> None:
        if gl.message.sender_address != self.client:
            raise gl.vm.UserError("only client can release payment")
        if self.status != COMPLETE:
            raise gl.vm.UserError("job is not complete")
        gl.send(self.awarded_to, self.escrow_amount)
        self.escrow_amount = u256(0)

    @gl.public.view
    def find_freelancers(self, query: str) -> list:
        pass  # TODO: search profile_index for top-5 matches and return metadata list
`,
  task: "Initialise `self.profile_index = gl.VectorStorage()` in `__init__`. In `apply()`, call `self.profile_index.add(bio, {\"applicant\": str(addr)})` after storing the application. Implement `find_freelancers()` to search the index with `top_k=5` and return the metadata dicts.",
  hints: [
    "Declare the field as `profile_index: gl.VectorStorage` at class level, then set `self.profile_index = gl.VectorStorage()` inside `__init__`.",
    "In `apply()`, after `self.applicant_count += 1`, add: `self.profile_index.add(bio, {\"applicant\": str(addr)})`.",
    "Full `find_freelancers`: `results = self.profile_index.search(query, top_k=5)` then `return [r[1] for r in results]`.",
  ],
};

export default content;
