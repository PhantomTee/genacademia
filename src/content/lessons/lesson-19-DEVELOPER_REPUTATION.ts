import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 19,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 19 — Multi-Modal AI: Scoring from Screenshots

Combining \`web.render\` (Lesson 18) with \`exec_prompt\` creates a **multi-modal scoring pipeline**: the LLM sees the actual rendered profile image, not just text. This captures visual signals like profile completeness, pinned repo quality, and contribution graph density.

### Passing Images to exec_prompt

\`\`\`python
screenshot = gl.nondet.web.render(url)
result = gl.nondet.exec_prompt(
    "Score this GitHub profile page 0-100 based on visual presentation and activity. Return only an integer.",
    images=[screenshot]
)
score = int(result.strip())
\`\`\`

The \`images\` parameter accepts a list of \`bytes\` objects. The LLM receives them as image inputs alongside the text prompt.

### Crafting the Visual Prompt

Guide the LLM on what to look for:

\`\`\`
"You are evaluating a GitHub developer profile screenshot.
Score it 0-100 considering:
- Profile completeness (bio, avatar, location)
- Number and quality of pinned repositories
- Contribution activity visible in the graph
- Professional presentation
Return ONLY an integer."
\`\`\`

### When to Use Visual vs Text Scoring

- **Text scoring** (web.get) — better for README content, code quality signals
- **Visual scoring** (web.render) — better for profile presentation, activity patterns

Combining both (Lesson 20) yields the most comprehensive assessment.

### Your Mission

Implement \`visual_score(dev)\` to render the developer's GitHub profile and pass the screenshot to \`exec_prompt\` for a 0–100 visual quality score.

**Key concepts this lesson:** \`exec_prompt\` with \`images\`, multi-modal LLM, visual scoring.`,
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

    @gl.public.write
    def register(self, handle: str, github_url: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.developers.get(gl.message.sender_address, None) is not None:
            raise gl.vm.UserError("already registered")
        profile = DevProfile(handle=handle, github_url=github_url)
        self.developers[gl.message.sender_address] = profile
        self.developer_count += 1

    def _safe_url(self, url: str) -> str:
        if not url.startswith("https://github.com/"):
            raise gl.vm.UserError("invalid GitHub URL")
        url = url.split()[0].split('"')[0].split("'")[0]
        return url

    @gl.public.write
    def visual_score(self, dev: Address) -> int:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `visual_score(dev)` to render the developer's GitHub profile page as a screenshot and pass it to `exec_prompt` (with `images=[screenshot]`) asking for a 0–100 quality score. Return the integer result.",
  hints: [
    "Retrieve the profile and github_url, then call `screenshot = gl.nondet.web.render(profile.github_url)` to get the image bytes.",
    "Call `result = gl.nondet.exec_prompt(prompt, images=[screenshot])` where the prompt asks for a score of 0-100. Use `response_format='text'`.",
    "Convert the result to an integer: `return int(result.strip())`.",
  ],
};

export default content;
