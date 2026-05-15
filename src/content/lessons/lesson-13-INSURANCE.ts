import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 13,
  projectPath: "INSURANCE",
  explanation: `## Lesson 13 — Listing Open Cases

### What You'll Learn

Students learn how to loop through case IDs and return cases that are not closed.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `@gl.public.view
def get_open_cases_json(self) -> str:
    result = []

    for case_id in self.case_ids:
        status = self.case_statuses[case_id]

        if status != "closed" and status != "cancelled":
            result.append({
                "id": case_id,
                "title": self.case_titles[case_id],
                "claim": self.case_claims[case_id],
                "claimant": self.case_claimants[case_id].as_hex,
                "respondent": self.case_respondents[case_id].as_hex,
                "case_fee": str(self.case_fees[case_id]),
                "status": status,
            })

    return json.dumps(result, sort_keys=True)
Returns a JSON array of active/open cases.
`,
  task: `Add:

get_open_cases_json()
Return cases with status:

submitted
reviewing
ruled
appealed
Do not include:

closed
cancelled`,
  hints: [
    "Add:.",
    "get_open_cases_json()",
    "Key line: `def get_open_cases_json(self) -> str:`",
  ],
};

export default content;
