import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 28,
  projectPath: "INSURANCE",
  explanation: `## Lesson 28 — Testing CaseWise

### What You'll Learn

You'll learn how to test the full dispute lifecycle.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    owner: Address
    court_name: str
    court_rules: str

    case_titles: TreeMap[str, str]
    case_claims: TreeMap[str, str]
    case_claimants: TreeMap[str, Address]
    case_respondents: TreeMap[str, Address]
    case_fees: TreeMap[str, u256]
    case_statuses: TreeMap[str, str]
    case_count: u256

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.court_name = "CaseWise"
        self.court_rules = "Parties submit cases and evidence for AI-assisted review."
        self.case_count = u256(0)

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

    @gl.public.write
    def submit_case(self, title: str, claim: str, respondent: Address, case_fee: u256) -> str:
        claimant = gl.message.sender_address

        assert len(title) > 0, "Title cannot be empty"
        assert len(claim) > 0, "Claim cannot be empty"
        assert claimant != respondent, "Claimant and respondent must be different"
        assert case_fee > u256(0), "Case fee must be greater than zero"

        case_id = str(self.case_count)

        self.case_titles[case_id] = title
        self.case_claims[case_id] = claim
        self.case_claimants[case_id] = claimant
        self.case_respondents[case_id] = respondent
        self.case_fees[case_id] = case_fee
        self.case_statuses[case_id] = "submitted"

        self.case_count += u256(1)

        return case_id
`,
  expectedCode: `@gl.public.view
def get_test_checklist_json(self) -> str:
    return json.dumps([
        "Submit a case with title, claim, respondent, and fee",
        "Reject a case with an empty claim",
        "Reject a case where claimant and respondent are the same",
        "Pay the case fee as claimant",
        "Reject fee payment from non-claimant",
        "Add claimant evidence",
        "Add respondent evidence",
        "Reject evidence from a non-party",
        "Run AI case review",
        "Verify AI ruling, confidence, and reason are stored",
        "Manually rule the case as owner",
        "Appeal the ruled case as a party",
        "Reject appeal from non-party"
    ], sort_keys=True)
`,
  task: `Add:

get_test_checklist_json()`,
  hints: [
    "Add:.",
    "get_test_checklist_json()",
    "Key line: `def get_test_checklist_json(self) -> str:`",
  ],
};

export default content;
