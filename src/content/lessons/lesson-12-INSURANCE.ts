import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 12,
  projectPath: "INSURANCE",
  explanation: `## Lesson 12 — Case JSON View

### What You'll Learn

Students learn how to expose one dispute case as JSON.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `import json
from genlayer import *
Method:

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
        "status": self.case_statuses[case_id],
    }, sort_keys=True)
{
  "id": "0",
  "title": "Payment dispute",
  "claim": "The freelancer did not deliver.",
  "claimant": "0x...",
  "respondent": "0x...",
  "case_fee": "100",
  "status": "submitted"
}
`,
  task: `Add:

import json
Create:

get_case_json(case_id: str) -> str`,
  hints: [
    "Add:.",
    "import json",
    "Key line: `def get_case_json(self, case_id: str) -> str:`",
  ],
};

export default content;
