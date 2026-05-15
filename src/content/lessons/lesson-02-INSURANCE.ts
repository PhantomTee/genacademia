import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 2,
  projectPath: "INSURANCE",
  explanation: `## Lesson 2 — Write Methods & Tracking Policyholders

In Lesson 1 you built a read-only view. Now you will add your first **write** method — a transaction that changes on-chain state.

### Write Methods

Decorate a method with \`@gl.public.write\` to allow it to modify contract state. Every call to a write method is a blockchain transaction recorded permanently.

\`\`\`python
@gl.public.write
def enroll(self, flight_number: str) -> None:
    # modify state here
\`\`\`

### Identifying the Caller

Inside any method, \`gl.message.sender_address\` gives you the **Address** of whoever submitted the transaction. For an insurance contract this is critical — it tells us who the policyholder is.

\`\`\`python
caller = gl.message.sender_address
\`\`\`

### Counting Enrollments

CaseWise needs to track how many policyholders have enrolled. Add an integer state variable and increment it each time someone calls \`enroll()\`:

\`\`\`python
holder_count: int  # state variable, starts at 0

def __init__(self, name: str) -> None:
    self.pool_name = name
    self.holder_count = 0

@gl.public.write
def enroll(self, flight_number: str) -> None:
    self.holder_count += 1
\`\`\`

### Returning State with a View

Pair every important state variable with a view method so external callers can read it:

\`\`\`python
@gl.public.view
def get_holder_count(self) -> int:
    return self.holder_count
\`\`\`

In the next lesson you will add validation so the same address cannot enroll twice. For now, focus on making write and view work together correctly.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl

class InsurancePool(gl.Contract):
    pool_name: str
    holder_count: int

    def __init__(self, name: str) -> None:
        self.pool_name = name
        self.holder_count = 0

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        pass

    @gl.public.view
    def get_holder_count(self) -> int:
        pass`,
  task: "Implement `enroll()` to record the caller as a policyholder and increment `holder_count`, then implement `get_holder_count()` to return the current count.",
  hints: [
    "Inside `enroll`, use `gl.message.sender_address` to identify who is enrolling. You'll need to store this in the next lesson — for now, just increment the counter.",
    "Add `self.holder_count += 1` inside `enroll()` to count each new enrollment.",
    "`get_holder_count` is a view — it just needs `return self.holder_count`.",
  ],
};

export default content;
