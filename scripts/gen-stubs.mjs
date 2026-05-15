import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SDK_HASH = "1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6";

const paths = [
  "PREDICTION_MARKET",
  "FREELANCE_ESCROW",
  "DAO",
  "DEVELOPER_REPUTATION",
  "INSURANCE",
];

const pathTitles = {
  PREDICTION_MARKET: "Prediction Market",
  FREELANCE_ESCROW: "Freelance Escrow",
  DAO: "DAO",
  DEVELOPER_REPUTATION: "Developer Reputation",
  INSURANCE: "Insurance",
};

const outDir = join(__dirname, "../src/content/lessons");

for (let lesson = 1; lesson <= 30; lesson++) {
  const padded = String(lesson).padStart(2, "0");
  for (const path of paths) {
    const title = pathTitles[path];
    const filePath = join(outDir, `lesson-${padded}-${path}.ts`);

    const code = `import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: ${lesson},
  projectPath: "${path}",
  explanation: \`## Lesson ${lesson} — ${title}

> This lesson content is coming soon. Replace this file with the actual lesson content.

Learn the concept introduced in lesson ${lesson} applied to the ${title} project.\`,
  starterCode: \`# { "Depends": "py-genlayer:${SDK_HASH}" }
from genlayer import gl

class MyContract(gl.Contract):
    value: str

    def __init__(self) -> None:
        self.value = "placeholder"

    @gl.public.view
    def get_value(self) -> str:
        return self.value\`,
  task: "Replace this file with the real lesson content for ${title}.",
  hints: [
    "Hint 1 for lesson ${lesson} (${title}) — coming soon.",
    "Hint 2 for lesson ${lesson} (${title}) — coming soon.",
    "Hint 3 for lesson ${lesson} (${title}) — coming soon.",
  ],
};

export default content;
`;

    writeFileSync(filePath, code, "utf8");
  }
}

console.log("Generated 150 stub files.");
