import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: 6,
  projectPath: "PREDICTION_MARKET",
  explanation: `## Lesson 6 — Market Storage Fields

### What You'll Learn

Students learn how to define persistent storage for multiple prediction markets.

New concept
Class-level storage fields:

market_questions: TreeMap[str, str]
market_creators: TreeMap[str, Address]
market_statuses: TreeMap[str, str]

### How It Works

A TreeMap stores many records by key. In PredictX, every market gets an ID like "0", "1", or "2", and each map stores one part of the market.`,
  starterCode: `Use the Lesson 5 code.
`,
  expectedCode: `No public output yet. The platform checks storage declarations.
`,
  task: `Add these persistent fields:

market_questions: TreeMap[str, str]
market_outcome_a: TreeMap[str, str]
market_outcome_b: TreeMap[str, str]
market_creators: TreeMap[str, Address]
market_statuses: TreeMap[str, str]
Expected code additions
market_questions: TreeMap[str, str]
market_outcome_a: TreeMap[str, str]
market_outcome_b: TreeMap[str, str]
market_creators: TreeMap[str, Address]
market_statuses: TreeMap[str, str]`,
  hints: [
    "Add these persistent fields:.",
    "market_questions: TreeMap[str, str]",
    "Key line: `No public output yet. The platform checks storage declarations.`",
  ],
};

export default content;
