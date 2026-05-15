export type ProjectPath =
  | "PREDICTION_MARKET"
  | "FREELANCE_ESCROW"
  | "DAO"
  | "DEVELOPER_REPUTATION"
  | "INSURANCE";

export type Level = "BEGINNER" | "DEVELOPER" | "WEB3";

export interface LessonContent {
  lessonId: number;
  projectPath: ProjectPath;
  explanation: string;
  starterCode: string;
  task: string;
  hints: [string, string, string];
}
