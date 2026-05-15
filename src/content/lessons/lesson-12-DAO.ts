import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "DAO",
  explanation: `## Lesson 12 — Dataclasses for Rich Proposal Objects

A proposal title alone is not enough for governance. Members need to know who proposed it, how many votes it has received, and what its current status is. The \`@dataclass\` decorator lets you bundle all this data into a typed, serialisable object that GenLayer stores on-chain.

### @dataclass

Python's \`dataclass\` decorator auto-generates \`__init__\`, \`__repr__\`, and other boilerplate. In GenLayer, dataclass instances can be stored as \`TreeMap\` values — the runtime handles serialisation transparently.

\`\`\`python
from dataclasses import dataclass

@dataclass
class Proposal:
    title: str
    proposer: Address
    votes_for: int = 0
    votes_against: int = 0
\`\`\`

Fields with default values (like \`votes_for = 0\`) are optional at construction time. Required fields (like \`title\` and \`proposer\`) must be provided.

### Creating a Proposal

\`\`\`python
p = Proposal(
    title=title,
    proposer=gl.message.sender_address,
)
self.proposals[pid] = p
\`\`\`

### The vote Stub

\`vote(pid, approve)\` will let members cast a vote for or against a proposal. For now it is stubbed as \`pass\` — you will implement it in the next lesson. The signature — pid (int) and approve (bool) — is all that matters here.

### Upgrading TreeMap Value Type

Change \`proposals\` from \`TreeMap[int, str]\` to \`TreeMap[int, Proposal]\`. This is a breaking change: migrate your \`submit_proposal\` method to store full \`Proposal\` objects instead of plain strings.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap, DynArray
from dataclasses import dataclass

# TODO: define Proposal dataclass with: title (str), proposer (Address),
#       votes_for (int=0), votes_against (int=0)

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    proposal_count: int
    members: TreeMap[Address, bool]
    proposals: TreeMap[int, "Proposal"]
    proposal_ids: DynArray[int]

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, Proposal]()
        self.proposal_ids = DynArray[int]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.write
    def submit_proposal(self, title: str) -> int:
        # TODO: create a Proposal(title=title, proposer=gl.message.sender_address)
        # TODO: store in self.proposals, append id to proposal_ids, increment count
        # TODO: return the proposal id
        pass

    @gl.public.write
    def vote(self, pid: int, approve: bool) -> None:
        pass`,
  task: "Define the `Proposal` dataclass with `title`, `proposer`, `votes_for=0`, and `votes_against=0`, then update `submit_proposal()` to create and store a full `Proposal` object.",
  hints: [
    "Add `@dataclass` decorator above `class Proposal:` and list fields with type annotations; use `= 0` defaults for vote counters.",
    "In `submit_proposal`: `pid = self.proposal_count; p = Proposal(title=title, proposer=gl.message.sender_address); self.proposals[pid] = p`.",
    "Append and increment: `self.proposal_ids.append(pid); self.proposal_count += 1; return pid`.",
  ],
};

export default content;
