import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 7,
  projectPath: "INSURANCE",
  explanation: `## Lesson 7 — Party Address Tracking

### What You'll Learn

You'll learn how to track the parties in a dispute.

The claimant is the caller who submits the case:

gl.message.sender_address
The respondent is passed as an Address.`,
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
  expectedCode: `@gl.public.write
def submit_case(self, title: str, claim: str, respondent: Address) -> str:
    case_id = "0"

    self.case_titles[case_id] = title
    self.case_claims[case_id] = claim
    self.case_claimants[case_id] = gl.message.sender_address
    self.case_respondents[case_id] = respondent
    self.case_statuses[case_id] = "submitted"

    return case_id
`,
  task: `Add a first version of:

submit_case(title: str, claim: str, respondent: Address) -> str
For now, use:

case_id = "0"
Store:

self.case_claimants[case_id] = gl.message.sender_address
self.case_respondents[case_id] = respondent`,
  hints: [
    "Add a first version of:.",
    "submit_case(title: str, claim: str, respondent: Address) -> str",
    "Key line: `def submit_case(self, title: str, claim: str, respondent: Address) -> str:`",
  ],
};

export default content;
