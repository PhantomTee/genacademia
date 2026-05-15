import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 18,
  projectPath: "INSURANCE",
  explanation: `## Lesson 18 — Evidence and Party Rules

### What You'll Learn

Students learn to expose evidence safely in JSON and make sure the frontend can show both sides.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Update get_case_json to include:

paid_amount
claimant_evidence
respondent_evidence
Expected updated get_case_json
@gl.public.view
def get_case_json(self, case_id: str) -> str:
    assert case_id in self.case_titles, "Case not found"

    return json.dumps({
        "id": case_id,
        "title": self.case_titles[case_id],
        "claim": self.case_claims[case_id],
        "claimant": self.case_claimants[case_id].as_hex,
        "respondent": self.case_respondents[case_id].as_hex,
        "case_fee": str(self.case_fees[case_id]),
        "paid_amount": str(self.case_paid_amounts[case_id]) if case_id in self.case_paid_amounts else "0",
        "claimant_evidence": self.case_claimant_evidence[case_id] if case_id in self.case_claimant_evidence else "",
        "respondent_evidence": self.case_respondent_evidence[case_id] if case_id in self.case_respondent_evidence else "",
        "status": self.case_statuses[case_id],
    }, sort_keys=True)`,
  hints: [
    "Update get_case_json to include:.",
    "paid_amount",
    "Key line: `After evidence is added:`",
  ],
};

export default content;
