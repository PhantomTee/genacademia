import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 15,
  projectPath: "INSURANCE",
  explanation: `## Lesson 15 — Major Upgrade: Browseable Case Dashboard

### What You'll Learn

Students combine:

case submission
case indexing
case JSON view
open case list
case cancellation
status filtering`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.view
def get_all_cases_json(self) -> str:
    result = []

    for case_id in self.case_ids:
        result.append({
            "id": case_id,
            "title": self.case_titles[case_id],
            "claim": self.case_claims[case_id],
            "claimant": self.case_claimants[case_id].as_hex,
            "respondent": self.case_respondents[case_id].as_hex,
            "case_fee": str(self.case_fees[case_id]),
            "status": self.case_statuses[case_id],
        })

    return json.dumps(result, sort_keys=True)
Returns cases with statuses like:

submitted
cancelled
reviewing
ruled
appealed
closed
`,
  task: `Add:

get_all_cases_json()
It returns all cases regardless of status.`,
  hints: [
    "Add:.",
    "get_all_cases_json()",
    "Key line: `def get_all_cases_json(self) -> str:`",
  ],
};

export default content;
