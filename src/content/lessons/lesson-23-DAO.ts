import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 23,
  projectPath: "DAO",
  explanation: `## Lesson 23 — VectorStorage: Semantic Proposal Search

With many proposals on-chain, members need a way to find relevant ones. GenLayer's \`gl.VectorStorage\` provides built-in semantic vector search — no external indexer required.

### gl.VectorStorage

Declare it as a contract state field and initialise it in \`__init__\`:

\`\`\`python
class GovernanceDAO(gl.Contract):
    proposal_index: gl.VectorStorage
    ...
    def __init__(self, name: str) -> None:
        ...
        self.proposal_index = gl.VectorStorage()
\`\`\`

### Indexing Documents

Call \`.add(text, metadata)\` to store a document. The text is embedded automatically; metadata is any dict you want returned with results:

\`\`\`python
self.proposal_index.add(proposal.title, {"pid": pid})
\`\`\`

Index proposals when they are submitted so the search index stays current.

### Searching

Call \`.search(query, top_k=N)\` to retrieve the most semantically similar entries. It returns a list of \`(score, metadata)\` tuples:

\`\`\`python
results = self.proposal_index.search(query, top_k=5)
# results = [(0.92, {"pid": 3}), (0.87, {"pid": 1}), ...]
\`\`\`

### Returning Results

Extract the metadata dicts for a clean return value:

\`\`\`python
return [r[1] for r in results]
# → [{"pid": 3}, {"pid": 1}, ...]
\`\`\`

### Why VectorStorage?

Traditional on-chain storage only supports exact lookups. \`VectorStorage\` lets members search for proposals by concept — e.g. "infrastructure grants" returns relevant proposals even if the word "infrastructure" never appears in the title.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass

PENDING = "PENDING"
APPROVED = "APPROVED"
REJECTED = "REJECTED"
EXECUTED = "EXECUTED"

MIN_MEMBERSHIP_FEE = 10**15  # 0.001 GEN in wei

@dataclass
class Proposal:
    title: str
    description: str
    ref_url: str
    proposer: Address
    status: str = "PENDING"
    votes_for: int = 0
    votes_against: int = 0
    executed: bool = False

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    proposal_count: int
    members: TreeMap[Address, bool]
    proposals: TreeMap[int, Proposal]
    proposal_index: gl.VectorStorage

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, Proposal]()
        # TODO: initialise self.proposal_index = gl.VectorStorage()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.write.payable
    def join(self) -> None:
        caller = gl.message.sender_address
        if gl.message.value < MIN_MEMBERSHIP_FEE:
            raise gl.vm.UserError("Membership fee too low")
        if self.members.get(caller, False):
            raise gl.vm.UserError("Already a member")
        self.members[caller] = True
        self.member_count += 1
        self.treasury += gl.message.value

    @gl.public.write
    def submit_proposal(self, title: str, description: str, ref_url: str) -> int:
        caller = gl.message.sender_address
        if not self.members.get(caller, False):
            raise gl.vm.UserError("Members only")
        pid = self.proposal_count
        self.proposals[pid] = Proposal(
            title=title,
            description=description,
            ref_url=ref_url,
            proposer=caller,
        )
        self.proposal_count += 1
        # TODO: index the proposal title with self.proposal_index.add(title, {"pid": pid})
        return pid

    @gl.public.write
    def search_proposals(self, query: str) -> list:
        # TODO: call self.proposal_index.search(query, top_k=5)
        # TODO: return list of metadata dicts from results
        pass`,
  task: "Initialise `self.proposal_index = gl.VectorStorage()` in `__init__`, add `self.proposal_index.add(title, {\"pid\": pid})` in `submit_proposal()`, and implement `search_proposals()` to return the top-5 metadata dicts.",
  hints: [
    "In `__init__` add: `self.proposal_index = gl.VectorStorage()` — it must be declared as a class field `proposal_index: gl.VectorStorage` and also initialised here.",
    "In `submit_proposal` after incrementing `proposal_count`, call `self.proposal_index.add(title, {\"pid\": pid})` to index the new proposal.",
    "In `search_proposals`: `results = self.proposal_index.search(query, top_k=5)` returns `[(score, metadata), ...]` — return `[r[1] for r in results]`.",
  ],
};

export default content;
