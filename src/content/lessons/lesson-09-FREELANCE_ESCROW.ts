import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 9,
  projectPath: "FREELANCE_ESCROW",
  explanation: `## Lesson 9 — Fetching Real Web Content

Evaluating a freelancer based only on their portfolio *URL* is shallow — the LLM is essentially guessing from a domain name. GenLayer lets contracts fetch actual web content at transaction time via \`gl.nondet.web.get\`.

### gl.nondet.web.get

\`\`\`python
html = gl.nondet.web.get("https://example.com/portfolio")
\`\`\`

This returns the raw HTTP response body as a string. Every validator node fetches the same URL independently; GenLayer's consensus protocol reconciles any minor differences in the returned content.

### Truncating for the Prompt Window

Web pages can be very large. LLMs have context limits, and sending a 500 KB HTML dump is slow and expensive. A practical rule is to take only the first 2 000 characters:

\`\`\`python
content = gl.nondet.web.get(url)[:2000]
\`\`\`

This typically captures the \`<head>\` metadata and the hero section — enough for a meaningful assessment.

### Enriched Prompt

Combine the fetched content with the job description:

\`\`\`
Job title: Build a personal portfolio website...
Portfolio content: <html><head><title>Jane Doe – Frontend...
\`\`\`

The LLM now has real evidence to work with rather than just a URL, leading to much more reliable HIRE / PASS decisions.

### Error Handling

If the URL is unreachable, \`web.get\` may raise. Wrap in a try/except and fall back to URL-only evaluation if needed.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import gl
from genlayer.types import Address, u256


class FreelanceEscrow(gl.Contract):
    title: str
    client: Address
    budget: u256
    is_open: bool
    applicant_count: int
    last_applicant: Address
    awarded_to: Address

    def __init__(self, title: str, budget: u256) -> None:
        self.title = title
        self.client = gl.message.sender_address
        self.budget = budget
        self.is_open = True
        self.applicant_count = 0

    @gl.public.view
    def get_title(self) -> str:
        return self.title

    @gl.public.write
    def apply(self, bio: str) -> None:
        if not bio:
            raise gl.vm.UserError("bio required")
        if self.last_applicant == gl.message.sender_address:
            raise gl.vm.UserError("already applied")
        self.applicant_count += 1
        self.last_applicant = gl.message.sender_address

    def _safe_text(self, text: str) -> str:
        clean = text.replace("\\n", " ").replace("\\r", " ")
        for ch in ["[", "]", "{", "}"]:
            clean = clean.replace(ch, "")
        return clean[:500]

    @gl.public.write
    def evaluate_applicant(self, applicant: Address, portfolio_url: str) -> dict:
        safe_url = self._safe_text(portfolio_url)
        # TODO: fetch the portfolio page with gl.nondet.web.get
        # TODO: truncate to first 2000 chars
        # TODO: include the content in the prompt alongside self.title
        prompt = (
            f"Job title: {self.title}\\n"
            f"Portfolio URL: [USER INPUT: {safe_url}]\\n"
            "Respond with JSON only: {\\\"hire\\\": bool, \\\"reason\\\": str, \\\"score\\\": 0-100}"
        )
        return gl.nondet.exec_prompt(prompt, response_format="json")
`,
  task: "Update `evaluate_applicant()` to fetch the portfolio page using `gl.nondet.web.get(portfolio_url)`, truncate the result to 2 000 characters, and include it in the prompt as `Portfolio content: {content}`.",
  hints: [
    "`gl.nondet.web.get(url)` returns the page body as a string — assign it to a variable.",
    "Truncate immediately: `content = gl.nondet.web.get(safe_url)[:2000]`.",
    "Add `f'Portfolio content: {content}\\\\n'` to your prompt string before calling `exec_prompt`.",
  ],
};

export default content;
