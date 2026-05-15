import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "INSURANCE",
  explanation: `## Lesson 6 — Case Storage Fields

### What You'll Learn

You'll learn how to model dispute cases using persistent maps.

A case needs:

title
claim description
claimant
respondent
status`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."

    @gl.public.view
    def get_court_name(self) -> str:
        return self.court_name

    @gl.public.view
    def get_court_rules(self) -> str:
        return self.court_rules

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner.as_hex

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self.court_name + ": " + self.court_rules

    @gl.public.write
    def update_court_rules(self, new_rules: str) -> None:
        assert gl.message.sender_address == self.owner, "Only owner can update rules"
        assert len(new_rules) > 0, "Rules cannot be empty"

        self.court_rules = new_rules
`,
  task: `Add:

case_titles: TreeMap[str, str]
case_claims: TreeMap[str, str]
case_claimants: TreeMap[str, Address]
case_respondents: TreeMap[str, Address]
case_statuses: TreeMap[str, str]`,
  hints: [
    "Add:.",
    "case_titles: TreeMap[str, str]",
    "Key line: `case_titles: TreeMap[str, str]`",
  ],
};

export default content;
