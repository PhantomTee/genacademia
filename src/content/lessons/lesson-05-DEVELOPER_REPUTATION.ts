import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 5,
  projectPath: "DEVELOPER_REPUTATION",
  explanation: `## Lesson 5 — Capstone: Registry Identity Contract

You have learned state, views, writes, validation, and typed addresses. This capstone lesson ties them together into a complete **registry identity contract** — the foundation of CodeVault.

### The Pause Pattern

Production contracts often include an emergency stop. A boolean flag \`active\` combined with a curator-only \`pause()\` function provides a simple, auditable kill switch:

\`\`\`python
active: bool

@gl.public.write
def pause(self) -> None:
    if gl.message.sender_address != self.curator:
        raise gl.vm.UserError("only curator can pause")
    if not self.active:
        raise gl.vm.UserError("already paused")
    self.active = False
\`\`\`

### Access Control

Every privileged function should check the caller against the stored curator address. This is the most fundamental access-control pattern in smart contracts — a single comparison that prevents unauthorised state changes.

### Complementary View

Pair every state flag with a view so clients can query it without a transaction:

\`\`\`python
@gl.public.view
def is_active(self) -> bool:
    return self.active
\`\`\`

### Capstone Checklist

By the end of this lesson your CodeVault contract should:
- Store registry name, curator, registry_id, and an active flag
- Allow only the curator to pause the registry
- Expose \`get_registry_name\`, \`get_curator\`, \`is_active\`, and \`get_developer_count\`
- Validate all inputs and guard against double-pause

**Key concepts this lesson:** curator-only guards, pause pattern, capstone integration.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256, TreeMap


class DeveloperReputation(gl.Contract):
    registry_name: str
    developer_count: int
    registered: TreeMap[Address, bool]
    curator: Address
    registry_id: u256
    active: bool

    def __init__(self, name: str, registry_id: u256) -> None:
        self.registry_name = name
        self.developer_count = 0
        self.registered = TreeMap[Address, bool]()
        self.curator = gl.message.sender_address
        self.registry_id = registry_id
        self.active = True

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
    def pause(self) -> None:
        pass

    @gl.public.write
    def register(self, handle: str) -> None:
        if not handle:
            raise gl.vm.UserError("handle cannot be empty")
        if self.registered.get(gl.message.sender_address, False):
            raise gl.vm.UserError("already registered")
        self.registered[gl.message.sender_address] = True
        self.developer_count += 1

    @gl.public.view
    def get_developer_count(self) -> int:
        return self.developer_count
`,
  task: "Implement `pause()` so that only the curator can call it, raise a `UserError` if already paused, and set `self.active = False`.",
  hints: [
    "Check `gl.message.sender_address != self.curator` and raise `gl.vm.UserError('only curator can pause')` if true.",
    "Then check `if not self.active` and raise `gl.vm.UserError('already paused')` to prevent double-pause.",
    "Finally, set `self.active = False` to complete the pause.",
  ],
};

export default content;
