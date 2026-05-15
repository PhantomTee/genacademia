import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 12 — Dataclasses for Rich Application Records

Storing just a bio string is limiting. TrustLance needs to track a freelancer's portfolio URL and their AI evaluation score alongside the bio. Python's \`@dataclass\` decorator lets you bundle these fields into a single typed value.

### Defining the Dataclass

\`\`\`python
from dataclasses import dataclass

@dataclass
class Application:
    bio: str
    portfolio_url: str
    score: int = 0
\`\`\`

GenLayer can serialise dataclasses to persistent storage — treat them as plain structs.

### TreeMap of Dataclasses

\`\`\`python
applications: TreeMap[Address, Application]

# Store
self.applications[sender] = Application(bio=bio, portfolio_url=url)

# Read
app = self.applications[addr]
print(app.bio, app.score)
\`\`\`

### Updating a Field

To update the score after evaluation, read the struct, mutate the field, and write it back:

\`\`\`python
app = self.applications[applicant]
app.score = result["score"]
self.applications[applicant] = app
\`\`\`

### Evolving \`apply\` and \`evaluate_applicant\`

- \`apply(bio, portfolio_url)\` now accepts two parameters and creates an \`Application\` object.
- \`evaluate_applicant\` writes the score back into the map after the LLM returns it.

This richer data model prepares TrustLance for visual evaluation in Lesson 19.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


@dataclass
class Application:
    bio: str
    portfolio_url: str
    score: int = 0  # populated after AI evaluation


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    is_open: bool
    status: str
    applicant_count: int
    applications: TreeMap[Address, Application]
    awarded_to: Address

    def __init__(self, title: str, budget: u256) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.is_open = True
        self.status = "OPEN"
        self.applicant_count = 0
        self.applications = TreeMap[Address, Application]()

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.write
    def apply(self, bio: str, portfolio_url: str) -> None:
        if not bio:
            raise gl.vm.UserError("bio required")
        if self.applications.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already applied")
        # TODO: create an Application dataclass instance and store it in self.applications
        self.applicant_count += 1

    @gl.public.view
    def get_applicant_count(self) -> int:
        return self.applicant_count

    @gl.public.view
    def get_application(self, applicant: Address) -> str:
        app = self.applications.get(applicant, None)
        return app.bio if app else ""

    def _safe_text(self, text: str) -> str:
        clean = text.replace("\\n", " ").replace("\\r", " ")
        for ch in ["[", "]", "{", "}"]:
            clean = clean.replace(ch, "")
        return clean[:500]

    @gl.public.write
    def evaluate_applicant(self, applicant: Address) -> dict:
        app = self.applications.get(applicant, None)
        if app is None:
            raise gl.vm.UserError("applicant not found")
        safe_url = self._safe_text(app.portfolio_url)
        content = gl.nondet.web.get(safe_url)[:2000]
        prompt = (
            f"Job: {self.title}\\n"
            f"Bio: [USER INPUT: {self._safe_text(app.bio)}]\\n"
            f"Portfolio content: {content}\\n"
            'Respond JSON: {"hire": bool, "reason": str, "score": 0-100}'
        )
        result = gl.nondet.exec_prompt(prompt, response_format="json")
        # TODO: update app.score from result["score"] and write back to self.applications
        return result
`,
  task: "In `apply()`, create `Application(bio=bio, portfolio_url=portfolio_url)` and store it in `self.applications`. In `evaluate_applicant()`, read `result['score']`, set `app.score`, and write the updated struct back into the map.",
  hints: [
    "Create the dataclass: `app = Application(bio=bio, portfolio_url=portfolio_url)` then `self.applications[gl.message.sender_address] = app`.",
    "After getting the LLM result, read back the record: `app = self.applications[applicant]`, set `app.score = result['score']`.",
    "Write the updated struct back: `self.applications[applicant] = app`.",
  ],
};

export default content;
