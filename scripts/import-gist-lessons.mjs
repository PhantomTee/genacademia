#!/usr/bin/env node
// scripts/import-gist-lessons.mjs
// Parses gist-curriculum.md and writes TypeScript lesson content files for
// PREDICTION_MARKET (Track 1 / PredictX) and INSURANCE (Track 5 / CaseWise).

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const GIST_PATH = resolve(ROOT, "scripts", "gist-curriculum.md");
const LESSONS_DIR = resolve(ROOT, "src", "content", "lessons");

const REAL_HASH = "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6";

// ── Section header patterns (order matters for the state machine) ─────────────
const SECTION_PATTERNS = [
  { key: "FINAL_CONTRACT", re: /^Final \w.* contract$/ },
  { key: "STARTER_CODE",   re: /^Starter code$/ },
  { key: "EXPLANATION",    re: /^Explanation$/ },
  { key: "WHAT_LEARN",     re: /^What students learn$/ },
  { key: "WHAT_DO",        re: /^What they (do|build)$/ },
  { key: "TASK",           re: /^Student task$/ },
  { key: "EXPECTED",       re: /^Expected (final code|code addition|code|output)$/ },
  { key: "VERIFICATION",   re: /^Platform verification$/ },
];

function detectSection(line) {
  for (const { key, re } of SECTION_PATTERNS) {
    if (re.test(line.trim())) return key;
  }
  return null;
}

// ── Split full gist into per-lesson blocks for a given track ──────────────────
function extractTrackLessons(fullText, trackMarker) {
  const lines = fullText.split("\n");

  // Find the track start line
  let trackStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(trackMarker)) { trackStart = i; break; }
  }
  if (trackStart === -1) throw new Error(`Track not found: ${trackMarker}`);

  // Find the next track start (or end of file)
  let trackEnd = lines.length;
  for (let i = trackStart + 1; i < lines.length; i++) {
    if (/^Track \d+:/.test(lines[i]) && i > trackStart + 5) { trackEnd = i; break; }
  }

  const trackLines = lines.slice(trackStart, trackEnd);

  // Find lesson boundaries within the track
  const lessonStarts = [];
  for (let i = 0; i < trackLines.length; i++) {
    const m = trackLines[i].match(/^Lesson (\d+)\s+[—–\-].+/);
    if (m) lessonStarts.push({ lineNum: i, lessonId: parseInt(m[1], 10) });
  }

  const lessons = [];
  for (let i = 0; i < lessonStarts.length; i++) {
    const start = lessonStarts[i].lineNum;
    const end = i + 1 < lessonStarts.length ? lessonStarts[i + 1].lineNum : trackLines.length;
    lessons.push({
      lessonId: lessonStarts[i].lessonId,
      title: trackLines[start].replace(/^Lesson \d+\s+[—–\-]\s*/, "").trim(),
      lines: trackLines.slice(start + 1, end), // lines after the heading
    });
  }
  return lessons;
}

// ── Parse a lesson's lines into structured sections ───────────────────────────
function parseLessonSections(lines) {
  const sections = {
    WHAT_LEARN: [],
    WHAT_DO: [],
    STARTER_CODE: [],
    FINAL_CONTRACT: [],
    EXPLANATION: [],
    TASK: [],
    EXPECTED: [],
    VERIFICATION: [],
    OTHER: [],
  };

  let current = "OTHER";
  for (const line of lines) {
    const detected = detectSection(line);
    if (detected) {
      current = detected;
      continue; // skip the header line itself
    }
    if (sections[current]) sections[current].push(line);
    else sections.OTHER.push(line);
  }
  return sections;
}

// ── Normalize smart quotes using charCodeAt (avoids encoding issues) ───────────
function normalizeQuotes(s) {
  let r = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0x2018 || c === 0x2019) r += "'";
    else if (c === 0x201C || c === 0x201D) r += '"';
    else r += s[i];
  }
  return r;
}

// ── Escape backticks and template literal special chars in strings ─────────────
function tsEscape(s) {
  return normalizeQuotes(s)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

// ── Sanitize plain text (for hints inside JS double-quoted strings) ───────────
function sanitizeForDQString(s) {
  return normalizeQuotes(s)
    .replace(/"/g, "'")
    .replace(/\\/g, "/")
    .replace(/\n/g, " ")
    .trim();
}
// ── Fix dependency hash in starter code ───────────────────────────────────────
function fixHash(code) {
  return code.replace(/py-genlayer:test/g, REAL_HASH);
}

// ── Build markdown explanation from gist sections ─────────────────────────────
function buildExplanation(title, lessonId, sections) {
  const parts = [`## Lesson ${lessonId} — ${title}`, ""];

  const whatLearn = sections.WHAT_LEARN.join("\n").trim();
  if (whatLearn) {
    parts.push("### What You'll Learn", "", whatLearn, "");
  }

  const whatDo = sections.WHAT_DO.join("\n").trim();
  if (whatDo) {
    parts.push(whatDo, "");
  }

  const explanation = sections.EXPLANATION.join("\n").trim();
  if (explanation) {
    // Wrap any bare code-looking lines in fenced blocks
    const formatted = formatExplanationCode(explanation);
    parts.push("### How It Works", "", formatted, "");
  }

  return parts.join("\n").trim();
}

// ── Wrap bare Python code snippets inside explanation text in fenced blocks ───
function formatExplanationCode(text) {
  const lines = text.split("\n");
  const out = [];
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isCodeLine =
      /^\s{4}/.test(line) ||                                    // indented
      /^(from genlayer|import |class |def |self\.|@gl\.|#)/.test(line.trim()) || // Python keyword
      /^(gl\.|u256|str|bool|Address|TreeMap|DynArray)/.test(line.trim());

    const isBlank = line.trim() === "";
    const prevIsCode = i > 0 && out.length > 0 && inCode;

    if (isCodeLine && !inCode) {
      out.push("```python");
      inCode = true;
    } else if (!isCodeLine && !isBlank && inCode) {
      out.push("```", "");
      inCode = false;
    } else if (isBlank && inCode) {
      // Check if next non-blank is still code
      let nextCode = false;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === "") continue;
        nextCode =
          /^\s{4}/.test(lines[j]) ||
          /^(from genlayer|import |class |def |self\.|@gl\.|#)/.test(lines[j].trim());
        break;
      }
      if (!nextCode) {
        out.push("```", "");
        inCode = false;
        continue;
      }
    }

    out.push(line);
  }

  if (inCode) out.push("```");
  return out.join("\n");
}

// ── Extract clean Python code from a section's lines ─────────────────────────
function extractCode(lines) {
  // Strip leading/trailing blank lines
  const trimmed = lines.join("\n").trim();
  if (!trimmed) return "";
  return fixHash(trimmed) + "\n";
}

// ── Generate 3 contextual hints ───────────────────────────────────────────────
function generateHints(taskText, expectedLines) {
  const taskLines = taskText.split("\n").filter(l => l.trim());
  const expCode = expectedLines.join("\n").trim();

  // Hint 1: Where to look (first meaningful task sentence)
  const hint1 = taskLines.length > 0
    ? taskLines[0].trim().replace(/\.$/, "") + "."
    : "Read the task description carefully — the change is small.";

  // Hint 2: How to approach (second task line or derived from expected)
  let hint2 = taskLines.length > 1
    ? taskLines[1].trim()
    : "Look at the expected code section for the exact pattern to follow.";
  if (hint2.length < 10) hint2 = "Compare your code against the expected output in the lesson guide.";

  // Hint 3: Near-answer — key line from expected code
  const codeLines = expCode.split("\n").filter(l => l.trim() && !l.startsWith("#"));
  let hint3 = "Check the expected code — the solution is there.";
  if (codeLines.length > 0) {
    const keyLine = codeLines.find(l => /def |self\.|return /.test(l)) || codeLines[0];
    hint3 = `Key line: \`${keyLine.trim()}\``;
  }

  return [hint1, hint2, hint3];
}

// ── Build the TypeScript file content ─────────────────────────────────────────
function buildTsFile(lessonId, projectPath, title, sections) {
  const starterLines = sections.STARTER_CODE.length > 0
    ? sections.STARTER_CODE
    : sections.FINAL_CONTRACT;

  const starterCode = extractCode(starterLines) ||
    `# { "Depends": "${REAL_HASH}" }\n\nfrom genlayer import *\n\n# Continue building your contract — add the method described in the task\n`;

  const explanation = buildExplanation(title, lessonId, sections);

  const taskLines = sections.TASK.join("\n").trim();
  const expectedLines = sections.EXPECTED;
  const [h1, h2, h3] = generateHints(taskLines, expectedLines);

  const escaped = {
    explanation: tsEscape(explanation),
    starterCode: tsEscape(starterCode),
    task: tsEscape(taskLines),
    h1: sanitizeForDQString(h1),
    h2: sanitizeForDQString(h2),
    h3: sanitizeForDQString(h3),
  };

  return `import type { LessonContent } from "@/types/content";

const content: LessonContent = {
  lessonId: ${lessonId},
  projectPath: "${projectPath}",
  explanation: \`${escaped.explanation}\`,
  starterCode: \`${escaped.starterCode}\`,
  task: \`${escaped.task}\`,
  hints: [
    "${escaped.h1}",
    "${escaped.h2}",
    "${escaped.h3}",
  ],
};

export default content;
`;
}

// ── Write a lesson file ────────────────────────────────────────────────────────
function writeLessonFile(lessonId, projectPath, tsContent) {
  const nn = String(lessonId).padStart(2, "0");
  const filePath = resolve(LESSONS_DIR, `lesson-${nn}-${projectPath}.ts`);
  writeFileSync(filePath, tsContent, "utf8");
  return filePath;
}

// ── Extract verification spec from lesson sections (for reporting) ─────────────
function extractVerification(sections) {
  const raw = sections.VERIFICATION.join("\n").trim();
  if (!raw) return null;
  // Parse the JS-like object into extractable fields
  const methodMatch = raw.match(/requiredMethods:\s*\[([^\]]*)\]/s);
  const methods = methodMatch
    ? (methodMatch[1].match(/"([^"]+)"/g) ?? []).map(s => s.replace(/"/g, ""))
    : [];
  const klass = raw.match(/requiredClass:\s*"([^"]+)"/)?.[1] ?? null;
  const stringsMatch = raw.match(/requiredStrings:\s*\[([^\]]*)\]/s);
  const strings = stringsMatch
    ? (stringsMatch[1].match(/"([^"]+)"/g) ?? []).map(s => s.replace(/"/g, ""))
    : [];
  return { rawVerification: raw, klass, methods, strings };
}

// ── Main ──────────────────────────────────────────────────────────────────────
const gistContent = readFileSync(GIST_PATH, "utf8");

const TRACKS = [
  { marker: "Track 1: PredictX",  projectPath: "PREDICTION_MARKET" },
  { marker: "Track 5: CaseWise",  projectPath: "INSURANCE" },
];

const specReport = {}; // lessonId → { PM: ..., INS: ... }

for (const { marker, projectPath } of TRACKS) {
  console.log(`\n── Processing ${projectPath} ──────────────────`);
  const lessons = extractTrackLessons(gistContent, marker);
  console.log(`   Found ${lessons.length} lessons`);

  for (const lesson of lessons) {
    const sections = parseLessonSections(lesson.lines);
    const tsContent = buildTsFile(lesson.lessonId, projectPath, lesson.title, sections);
    const filePath = writeLessonFile(lesson.lessonId, projectPath, tsContent);
    const rel = filePath.replace(ROOT, "").replace(/\\/g, "/");
    console.log(`   ✓ ${rel}`);

    // Collect spec info
    const verif = extractVerification(sections);
    if (verif) {
      if (!specReport[lesson.lessonId]) specReport[lesson.lessonId] = {};
      specReport[lesson.lessonId][projectPath] = verif;
    }
  }
}

// ── Print spec report for manual review ───────────────────────────────────────
console.log("\n\n── Verification Spec Report ─────────────────────────────────");
for (const [lessonId, paths] of Object.entries(specReport)) {
  console.log(`\nLesson ${lessonId}:`);
  for (const [path, info] of Object.entries(paths)) {
    console.log(`  ${path}:`);
    if (info.klass) console.log(`    class: ${info.klass}`);
    if (info.methods.length) console.log(`    methods: ${info.methods.join(", ")}`);
  }
}

console.log("\n✅ Done. Run the generate-other-tracks script next for FREELANCE_ESCROW, DAO, DEVELOPER_REPUTATION.");
