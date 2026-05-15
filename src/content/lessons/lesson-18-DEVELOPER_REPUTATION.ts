import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 18,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 18 — web.render: Screenshots of GitHub Profiles

Text-based scoring has limits — it misses the visual presentation of a developer's profile. \`gl.nondet.web.render\` fetches a URL and returns a **screenshot as bytes**, enabling visual analysis.

### web.render vs web.get

| | web.get | web.render |
|---|---|---|
| Returns | HTML string | PNG bytes |
| Use case | Text analysis | Visual analysis |
| Cost | Lower | Higher |

\`\`\`python
screenshot: bytes = gl.nondet.web.render(url)
\`\`\`

The screenshot captures the page as rendered by a headless browser — ideal for profile pages with avatars, pinned repositories, and contribution graphs.

### Returning Bytes from Contracts

A contract method can return \`bytes\`, which GenLayer encodes appropriately for clients. For screenshots, this lets a front-end display the captured image directly.

### Usage in CodeVault

Store the developer's \`github_url\` in their profile during registration (or update it later), then render it on demand:

\`\`\`python
@gl.public.write
def get_github_screenshot(self, dev: Address) -> bytes:
    profile = self.developers.get(dev, None)
    if profile is None:
        raise gl.vm.UserError("developer not found")
    if not profile.github_url:
        raise gl.vm.UserError("no GitHub URL on file")
    return gl.nondet.web.render(profile.github_url)
\`\`\`

### Your Mission

Implement \`get_github_screenshot()\` to render the developer's stored \`github_url\` and return the screenshot bytes.

**Key concepts this lesson:** \`gl.nondet.web.render\`, bytes return type, fetching stored profile data.`,
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
    def get_github_screenshot(self, dev: Address) -> bytes:
        pass

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `get_github_screenshot()` to retrieve the developer's stored `github_url`, raise a `UserError` if the developer or URL is missing, and return `gl.nondet.web.render(github_url)` bytes.",
  hints: [
    "Retrieve the profile: `profile = self.developers.get(dev, None)` — raise `UserError('developer not found')` if `None`.",
    "Check `if not profile.github_url: raise gl.vm.UserError('no GitHub URL on file')`.",
    "Return `gl.nondet.web.render(profile.github_url)` to capture and return the screenshot.",
  ],
};

export default content;
