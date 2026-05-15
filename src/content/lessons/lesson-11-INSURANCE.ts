import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 11,
  projectPath: "INSURANCE",
  explanation: `## Lesson 11 — Case Indexing with DynArray

### What You'll Learn

Students learn that the frontend needs an index of all case IDs.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  expectedCode: `After two cases, internal index holds:

["0", "1"]
`,
  task: `Add:

case_ids: DynArray[str]
Inside submit_case, add:

self.case_ids.append(case_id)
Expected code additions
case_ids: DynArray[str]
Inside submit_case:

self.case_ids.append(case_id)`,
  hints: [
    "Add:.",
    "case_ids: DynArray[str]",
    "Key line: `After two cases, internal index holds:`",
  ],
};

export default content;
