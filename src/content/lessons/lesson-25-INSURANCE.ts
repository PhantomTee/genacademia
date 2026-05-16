import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 25,
  projectPath: "INSURANCE",
  explanation: `## Lesson 25 — Major Upgrade: AI Arbitration Engine

### What You'll Learn

You'll combine:

case state
party evidence
AI review
structured ruling
confidence
reason storage
This makes CaseWise a true Intelligent Contract.`,
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
  expectedCode: `@gl.public.write
def review_case_with_ai(self, case_id: str) -> str:
    assert case_id in self.case_titles, "Case not found"
    assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing before AI review"
    assert case_id not in self.case_ai_rulings, "Case already reviewed by AI"

    prompt = (
        "You are reviewing a dispute case. "
        + "Title: "
        + self.case_titles[case_id]
        + ". Claim: "
        + self.case_claims[case_id]
        + ". Claimant evidence: "
        + (self.case_claimant_evidence[case_id] if case_id in self.case_claimant_evidence else "")
        + ". Respondent evidence: "
        + (self.case_respondent_evidence[case_id] if case_id in self.case_respondent_evidence else "")
        + ". Return exactly one line in this format: "
        + "CLAIMANT_WINS|LOW|reason, CLAIMANT_WINS|MEDIUM|reason, CLAIMANT_WINS|HIGH|reason, "
        + "RESPONDENT_WINS|LOW|reason, RESPONDENT_WINS|MEDIUM|reason, RESPONDENT_WINS|HIGH|reason, "
        + "SPLIT|LOW|reason, SPLIT|MEDIUM|reason, SPLIT|HIGH|reason, "
        + "or NEEDS_MORE_INFO|LOW|reason, NEEDS_MORE_INFO|MEDIUM|reason, NEEDS_MORE_INFO|HIGH|reason."
    )

    def run():
        return gl.nondet.exec_prompt(prompt)

    def validate_result(leader_result) -> bool:
        return isinstance(leader_result, gl.vm.Return) and len(str(leader_result.calldata).strip()) > 0

    result = gl.vm.run_nondet_unsafe(run, validate_result).strip()
    parts = result.split("|")

    assert len(parts) == 3, "AI result must contain ruling, confidence, and reason"

    ruling = parts[0]
    confidence = parts[1]
    reason = parts[2]

    assert (
        ruling == "CLAIMANT_WINS"
        or ruling == "RESPONDENT_WINS"
        or ruling == "SPLIT"
        or ruling == "NEEDS_MORE_INFO"
    ), "Invalid AI ruling"

    assert confidence == "LOW" or confidence == "MEDIUM" or confidence == "HIGH", "Invalid AI confidence"
    assert len(reason) > 0, "AI reason cannot be empty"

    self.case_ai_rulings[case_id] = ruling
    self.case_ai_confidences[case_id] = confidence
    self.case_ai_reasons[case_id] = reason

    return ruling
`,
  task: `Create the final version of:

review_case_with_ai(case_id: str) -> str`,
  hints: [
    "Create the final version of:.",
    "review_case_with_ai(case_id: str) -> str",
    "Key line: `def review_case_with_ai(self, case_id: str) -> str:`",
  ],
};

export default content;
