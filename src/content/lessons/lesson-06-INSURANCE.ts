import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "INSURANCE",
  explanation: `## Lesson 6 — Case Storage Fields

### What You'll Learn

Students learn how to model dispute cases using persistent maps.

A case needs:

title
claim description
claimant
respondent
status`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

# Continue building your contract — add the method described in the task
`,
  task: `Add:

case_titles: TreeMap[str, str]
case_claims: TreeMap[str, str]
case_claimants: TreeMap[str, Address]
case_respondents: TreeMap[str, Address]
case_statuses: TreeMap[str, str]
Expected code additions
case_titles: TreeMap[str, str]
case_claims: TreeMap[str, str]
case_claimants: TreeMap[str, Address]
case_respondents: TreeMap[str, Address]
case_statuses: TreeMap[str, str]`,
  hints: [
    "Add:.",
    "case_titles: TreeMap[str, str]",
    "Key line: `No callable output yet. The platform checks persistent storage.`",
  ],
};

export default content;
