import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "DAO",
  explanation: `## Lesson 2 — Write Methods and Membership Tracking

In Lesson 1 you read state. Now you will **write** to it. GovMind needs to know who its members are, so this lesson introduces the \`@gl.public.write\` decorator and membership tracking.

### Write Methods

The \`@gl.public.write\` decorator marks a **state-mutating** method. Calling a write method sends a transaction to the network — validators execute it, and state changes are committed to the ledger.

\`\`\`python
@gl.public.write
def join(self) -> None:
    self.member_count += 1
\`\`\`

### Who Is Calling?

Every transaction carries the sender's address. GenLayer exposes it as:

\`\`\`python
caller: Address = gl.message.sender_address
\`\`\`

You can store this address, compare it for access control, or log it for auditing — it is cryptographically authenticated by the network.

### Tracking Members

GovMind uses an integer counter \`member_count\` to keep a running tally. You also store the sender in a \`TreeMap\` so you can look up individual membership later. Increment the counter whenever a new member joins.

### Counting View

\`get_member_count()\` is a view method that exposes the private counter. Separating the storage variable from the public interface is good practice — it lets you change the internal representation without breaking callers.

This lesson introduces the **read-write pair** pattern that every DAO state variable follows: a write method mutates state, a view method exposes it. Master this pattern and all subsequent governance features will feel natural.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, TreeMap

class GovernanceDAO(gl.Contract):
    name: str
    member_count: int
    members: TreeMap[Address, bool]

    def __init__(self, name: str) -> None:
        self.name = name
        self.member_count = 0
        self.members = TreeMap[Address, bool]()

    @gl.public.view
    def get_name(self) -> str:
        return self.name

    @gl.public.write
    def join(self) -> None:
        pass

    @gl.public.view
    def get_member_count(self) -> int:
        pass`,
  task: "Implement `join()` to record the caller as a member (store in `self.members` and increment `self.member_count`), and `get_member_count()` to return the current count.",
  hints: [
    "`@gl.public.write` methods can mutate state; use `gl.message.sender_address` to get the caller's address.",
    "Store membership with `self.members[gl.message.sender_address] = True` then increment `self.member_count += 1`.",
    "`get_member_count()` just needs `return self.member_count`.",
  ],
};

export default content;
