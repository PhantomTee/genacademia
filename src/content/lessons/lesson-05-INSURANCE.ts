import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "INSURANCE",
  explanation: `## Lesson 5 — Capstone: Pool Identity Contract

This is your first capstone — you will complete a fully functional pool identity contract that combines everything from Lessons 1–4.

### Pool Lifecycle: Accepting Enrollments

An insurance pool is not always open. The insurer needs a way to **pause** enrollment — for example, at the cutoff before a flight departs. We model this with a boolean flag:

\`\`\`python
accepting_enrollments: bool
\`\`\`

### Access Control

Only the insurer (the account that deployed the contract) should be able to pause the pool. Any other caller should receive an error. This is the most fundamental access-control pattern on-chain:

\`\`\`python
@gl.public.write
def pause_pool(self) -> None:
    if gl.message.sender_address != self.insurer:
        raise gl.vm.UserError("not the insurer")
    if not self.accepting_enrollments:
        raise gl.vm.UserError("already paused")
    self.accepting_enrollments = False
\`\`\`

### Guard Enrollments

Once the pool is paused, \`enroll()\` must respect the flag:

\`\`\`python
@gl.public.write
def enroll(self, flight_number: str) -> None:
    if not self.accepting_enrollments:
        raise gl.vm.UserError("enrollment closed")
    ...
\`\`\`

### is_accepting View

Expose the current state to front-ends:

\`\`\`python
@gl.public.view
def is_accepting(self) -> bool:
    return self.accepting_enrollments
\`\`\`

### Capstone Checklist

- Pool is deployed with \`accepting_enrollments = True\`.
- \`pause_pool()\` flips the flag — insurer only.
- \`enroll()\` rejects if the pool is paused.
- \`is_accepting()\` returns current status.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256

class InsurancePool(gl.Contract):
    pool_name: str
    holder_count: int
    insurer: Address
    pool_id: u256
    accepting_enrollments: bool

    def __init__(self, name: str, pool_id: u256) -> None:
        self.pool_name = name
        self.holder_count = 0
        self.insurer = gl.message.sender_address
        self.pool_id = pool_id
        self.accepting_enrollments = True

    @gl.public.view
    def get_pool_name(self) -> str:
        return self.pool_name

    @gl.public.view
    def get_insurer(self) -> str:
        return str(self.insurer)

    @gl.public.write
    def enroll(self, flight_number: str) -> None:
        if not self.accepting_enrollments:
            raise gl.vm.UserError("enrollment closed")
        if len(flight_number) < 5:
            raise gl.vm.UserError("invalid flight number")
        self.holder_count += 1

    @gl.public.view
    def get_holder_count(self) -> int:
        return self.holder_count

    @gl.public.write
    def pause_pool(self) -> None:
        pass

    @gl.public.view
    def is_accepting(self) -> bool:
        pass`,
  task: "Implement `pause_pool()` so only the insurer can pause the pool (raise UserError otherwise or if already paused), and implement `is_accepting()` to return the current enrollment flag.",
  hints: [
    "Check `gl.message.sender_address != self.insurer` first and raise a UserError if so.",
    "Also check `if not self.accepting_enrollments` and raise UserError('already paused') to prevent redundant calls.",
    "`is_accepting` simply returns `self.accepting_enrollments`. `pause_pool` sets it to `False` after passing both checks.",
  ],
};

export default content;
