import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 12 — Dataclasses: Structured Per-Developer Profiles

Storing one field per \`TreeMap\` works, but it's unwieldy as data grows. Python **dataclasses** let you bundle related fields into a single typed struct, which GenLayer serialises into a single on-chain storage slot.

### Defining a Dataclass

\`\`\`python
from dataclasses import dataclass

@dataclass
class DevProfile:
    handle: str
    github_url: str
    score: int = 0
    endorsements: int = 0
    verified: bool = False
\`\`\`

Default values make fields optional at construction time, which is convenient for fields that get populated later (like \`score\` after AI evaluation).

### Using Dataclasses in TreeMap

\`\`\`python
developers: TreeMap[Address, DevProfile]

# Creating a profile
profile = DevProfile(handle=handle, github_url="")
self.developers[gl.message.sender_address] = profile

# Updating a field later
profile = self.developers[gl.message.sender_address]
profile.github_url = github_url
self.developers[gl.message.sender_address] = profile
\`\`\`

Note: after modifying a profile object, you must re-assign it to the \`TreeMap\` for the change to persist — GenLayer tracks mutations at the map-entry level.

### Benefits

- All developer data in one logical unit
- Type-safe fields with defaults
- Easy to extend: add a field to the dataclass and existing data keeps working

**Key concepts this lesson:** \`@dataclass\`, structured on-chain storage, TreeMap with complex values.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap
from dataclasses import dataclass


@dataclass
class DevProfile:
    handle: str
    github_url: str
    score: int = 0
    endorsements: int = 0
    verified: bool = False


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    curator: Address
    registry_id: u256
    active: bool
    developers: TreeMap[Address, DevProfile]

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.view
    def get_curator(self) -> str:
        return str(self.curator)

    @gl.public.view
    def is_active(self) -> bool:
        return self.active

    @gl.public.write
    def register(self, handle: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.developers.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already registered")
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Complete `register()` to create a `DevProfile` with the given handle (github_url empty, other fields at defaults) and store it in `self.developers` keyed by the sender's address, then increment `developer_count`.",
  hints: [
    "Create the profile with `profile = DevProfile(handle=handle, github_url='')`.",
    "Store it with `self.developers[gl.message.sender_address] = profile`.",
    "Then increment `self.developer_count += 1` to keep the counter in sync.",
  ],
};

export default content;
