import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 17,
  projectPath: "INSURANCE",
  explanation: `## Lesson 17 — Adding Evidence

### What You'll Learn

Students learn that a dispute contract should not store large files directly.

It should store evidence references such as:

IPFS CID
document hash
URL reference
encrypted file pointer
transaction hash`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

case_claimant_evidence: TreeMap[str, str]
case_respondent_evidence: TreeMap[str, str]
Add:

add_evidence(case_id: str, evidence_ref: str)
Rules:

Case must exist.
Evidence reference cannot be empty.
Only claimant or respondent can add evidence.
Case must be reviewing.
Store evidence under claimant or respondent depending on caller.
Expected code additions
case_claimant_evidence: TreeMap[str, str]
case_respondent_evidence: TreeMap[str, str]
Method:

@gl.public.write
def add_evidence(self, case_id: str, evidence_ref: str) -> None:
    assert case_id in self.case_titles, "Case not found"
    assert len(evidence_ref) > 0, "Evidence reference cannot be empty"
    assert self.case_statuses[case_id] == "reviewing", "Case must be reviewing to add evidence"

    caller = gl.message.sender_address
    claimant = self.case_claimants[case_id]
    respondent = self.case_respondents[case_id]

    assert caller == claimant or caller == respondent, "Only case parties can add evidence"

    if caller == claimant:
        self.case_claimant_evidence[case_id] = evidence_ref
    else:
        self.case_respondent_evidence[case_id] = evidence_ref`,
  hints: [
    "Add:.",
    "case_claimant_evidence: TreeMap[str, str]",
    "Key line: `Claimant evidence is stored when claimant calls.`",
  ],
};

export default content;
