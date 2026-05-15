import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 11,
  projectPath: "DAO",
  explanation: `## Lesson 11 — TreeMap and DynArray for Proposal Storage

GovMind now needs a proper data store for proposals. In Lesson 10 you stored a simple string. Now you will use a \`TreeMap[int, str]\` for keyed access and a \`DynArray[int]\` for ordered iteration — two workhorses of GenLayer on-chain storage.

### TreeMap

\`TreeMap[K, V]\` is a persistent ordered key-value store. You look up proposals by their integer ID in O(log n) time:

\`\`\`python
proposals: TreeMap[int, str]
self.proposals = TreeMap[int, str]()
self.proposals[0] = "Fund the CLI tool"
title = self.proposals.get(0, "")  # safe read with default
\`\`\`

Initialise once in \`__init__\` — never re-assign the TreeMap itself, only mutate it.

### DynArray

\`DynArray[int]\` is a resizable on-chain list. It lets you iterate all proposal IDs without knowing the count in advance:

\`\`\`python
proposal_ids: DynArray[int]
self.proposal_ids = DynArray[int]()
self.proposal_ids.append(pid)
for pid in self.proposal_ids: ...
\`\`\`

### The Submit Pattern

When a proposal is submitted:
1. Store in \`self.proposals[self.proposal_count] = title\`
2. Append the ID to \`self.proposal_ids\`
3. Increment \`self.proposal_count\`

### get_proposal View

Expose a \`get_proposal(pid)\` view that reads from the map safely, returning an empty string for unknown IDs. This prevents callers from crashing the contract with unknown keys.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap, DynArray

class GovernanceDAO(gl.Contract):
    name: str
    admin: Address
    treasury: u256
    member_count: int
    proposal_count: int
    members: TreeMap[Address, bool]
    proposals: TreeMap[int, str]
    proposal_ids: DynArray[int]

    def __init__(self, name: str) -> None:
        self.name = name
        self.admin = gl.message.sender_address
        self.treasury = u256(0)
        self.member_count = 0
        self.proposal_count = 0
        self.members = TreeMap[Address, bool]()
        self.proposals = TreeMap[int, str]()
        self.proposal_ids = DynArray[int]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.view
    def get_proposal(self, pid: int) -> str:
        pass

    @gl.public.write
    def submit_proposal(self, title: str) -> int:
        # TODO: store title in self.proposals at self.proposal_count
        # TODO: append self.proposal_count to self.proposal_ids
        # TODO: increment self.proposal_count
        # TODO: return the new proposal id
        pass`,
  task: "Add `proposals: TreeMap[int, str]` and `proposal_ids: DynArray[int]`, implement `submit_proposal()` to store proposals and return the new ID, and `get_proposal()` to safely read by ID.",
  hints: [
    "Store with: `self.proposals[self.proposal_count] = title` then `self.proposal_ids.append(self.proposal_count)`.",
    "Capture the id before incrementing: `pid = self.proposal_count`, then `self.proposal_count += 1`, then `return pid`.",
    "`get_proposal` uses `.get()` with a default: `return self.proposals.get(pid, '')`.",
  ],
};

export default content;
