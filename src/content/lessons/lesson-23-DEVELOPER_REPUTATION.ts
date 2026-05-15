import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 23,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 23 — VectorStorage: Semantic Developer Search

CodeVault has hundreds of registered developers. How do you find "a Python expert who works on DeFi"? Text search on handles won't cut it — you need **semantic search**. \`gl.VectorStorage\` provides on-chain vector embeddings and similarity search.

### Initialising VectorStorage

\`\`\`python
skill_index: gl.VectorStorage

def __init__(self, ...) -> None:
    self.skill_index = gl.VectorStorage()
\`\`\`

### Indexing a Developer

When a developer registers, add a document describing them to the index. The metadata dict is returned with search results:

\`\`\`python
self.skill_index.add(
    f"{handle}: developer with skills in {skills}",
    {"dev": str(gl.message.sender_address)}
)
\`\`\`

### Searching

\`\`\`python
results = self.skill_index.search(query, top_k=5)
# results is a list of dicts with "text", "metadata", "score"
\`\`\`

Each result's \`metadata\` dict contains the fields you stored at index time.

### find_developers Implementation

\`\`\`python
@gl.public.write
def find_developers(self, query: str) -> list:
    results = self.skill_index.search(query, top_k=5)
    return [r["metadata"]["dev"] for r in results]
\`\`\`

This returns a list of address strings for the top-5 most semantically relevant developers.

### Your Mission

Add \`self.skill_index = gl.VectorStorage()\` to \`__init__\`, index the developer's handle + skills string in \`register()\`, and implement \`find_developers()\`.

**Key concepts this lesson:** \`gl.VectorStorage\`, semantic indexing, similarity search.`,
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
    status: str = "UNVERIFIED"


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    curator: Address
    registry_id: u256
    active: bool
    developers: TreeMap[Address, DevProfile]
    endorsement_stakes: TreeMap[Address, u256]
    skill_index: gl.VectorStorage

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True
        self.developers = TreeMap[Address, DevProfile]()
        self.endorsement_stakes = TreeMap[Address, u256]()
        self.skill_index = gl.VectorStorage()

    @gl.public.view
    def get_registry_name(self) -> str:
        return self.registry_name

    @gl.public.view
    def get_curator(self) -> str:
        return str(self.curator)

    @gl.public.write
    def register(self, handle: str, github_url: str, skills: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.developers.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already registered")
        profile = DevProfile(handle=handle, github_url=github_url)
        self.developers[gl.message.sender_address] = profile
        self.developer_count += 1
        self.skill_index.add(
            f"{handle}: {skills}",
            {"dev": str(gl.message.sender_address)}
        )

    @gl.public.write
    def find_developers(self, query: str) -> list:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `find_developers(query)` to search `self.skill_index` with `top_k=5` and return a list of developer address strings extracted from the `metadata['dev']` field of each result.",
  hints: [
    "Call `results = self.skill_index.search(query, top_k=5)` to get the top 5 semantically similar developers.",
    "Each item in `results` is a dict with a `'metadata'` key containing the dict you stored at index time.",
    "Return `[r['metadata']['dev'] for r in results]` to get the list of address strings.",
  ],
};

export default content;
