import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 1,
  projectPath: "INSURANCE",
  explanation: `## Lesson 1 — What You Are Building: AI Dispute Court

### What You'll Learn

Students learn what an AI-assisted dispute-resolution system is.

A dispute system needs:

claimant
respondent
case title
case description
evidence
review fee
case status
ruling
appeal flow
The AI does not magically replace the court or arbitrator. It helps review the claims and evidence, then produces a structured recommendation.`,
  starterCode: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class CaseWise(gl.Contract):
    project_name: str

    def __init__(self) -> None:
        self.project_name = "CaseWise"

    @gl.public.view
    def get_project_name(self) -> str:
        return self.project_name
`,
  task: `Change the project name to:

CaseWise: AI-Assisted Dispute Resolution`,
  hints: [
    "Change the project name to:.",
    "CaseWise: AI-Assisted Dispute Resolution",
    "Key line: `def __init__(self) -> None:`",
  ],
};

export default content;
