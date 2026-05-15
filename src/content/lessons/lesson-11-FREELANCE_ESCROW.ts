import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 11,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 11 — TreeMap: Per-Applicant Storage

The \`last_applicant\` field only remembers *one* freelancer. To track every applicant we need a mapping from address to data — a \`TreeMap\`.

### TreeMap Basics

\`\`\`python
from genlayer.types import TreeMap

class FreelanceEscrow(gl.Contract):
    applications: TreeMap[Address, str]

    def __init__(self, title: str, budget: u256) -> None:
        ...
        self.applications = TreeMap[Address, str]()
\`\`\`

The type parameters mirror a typed dictionary: keys are \`Address\`, values are \`str\` (the bio for now).

### Writing and Reading

\`\`\`python
# Write
self.applications[gl.message.sender_address] = bio

# Read (safe — returns default if missing)
bio = self.applications.get(addr, "")

# Read (raises KeyError if missing)
bio = self.applications[addr]
\`\`\`

### Duplicate Detection with TreeMap

Now that every applicant is stored by address, duplicate detection becomes reliable: check whether the address key already exists before writing.

\`\`\`python
if self.applications.get(gl.message.sender_address, "") != "":
    raise gl.vm.UserError("already applied")
\`\`\`

### Adding get_application

A new view method \`get_application(self, applicant: Address) -> str\` lets the client read any applicant's bio on demand, removing the need for the old \`last_applicant\` field entirely.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    is_open: bool
    status: str
    applicant_count: int
    applications: TreeMap[Address, str]
    awarded_to: Address

    def __init__(self, title: str, budget: u256) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.is_open = True
        self.status = "OPEN"
        self.applicant_count = 0
        self.applications = TreeMap[Address, str]()  # TODO: ensure this is initialised

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.write
    def apply(self, bio: str) -> None:
        if not bio:
            raise gl.vm.UserError("bio required")
        # TODO: replace old last_applicant duplicate check with TreeMap lookup
        # TODO: store bio in self.applications keyed by sender
        self.applicant_count += 1

    @gl.public.view
    def get_applicant_count(self) -> int:
        return self.applicant_count

    @gl.public.view
    def get_application(self, applicant: Address) -> str:
        pass  # TODO: return bio from self.applications, or "" if not found
`,
  task: "Initialise `self.applications = TreeMap[Address, str]()` in `__init__`. Update `apply()` to check for duplicates via the TreeMap and store the bio. Implement `get_application()` to safely retrieve a bio.",
  hints: [
    "Check duplicates: `if self.applications.get(gl.message.sender_address, '') != '': raise gl.vm.UserError('already applied')`.",
    "Store the bio: `self.applications[gl.message.sender_address] = bio`.",
    "`get_application` returns `self.applications.get(applicant, '')` to avoid KeyError.",
  ],
};

export default content;
