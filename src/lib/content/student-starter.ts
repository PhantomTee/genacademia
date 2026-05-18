import type { LessonContent } from "@/types/content";
import type { StaticChecks } from "@/lib/genlayer/static-verify";
import { runStaticVerification } from "@/lib/genlayer/static-verify";
import type { VerificationSpec } from "@/lib/genlayer/verify";

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function collectBacktickSnippets(content: LessonContent) {
  const text = [content.task, ...content.hints].join("\n");
  return [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim());
}

function collectTaskCodeLines(content: LessonContent) {
  const text = [content.task, ...content.hints].join("\n");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) =>
      /(@gl\.|self\.|TreeMap\[|DynArray\[|u256\(|gl\.message|assert |return |json\.dumps|":\s*)/.test(
        line
      )
    );
}

function collectMethodNames(content: LessonContent, snippets: string[]) {
  const text = [content.task, ...content.hints, ...snippets].join("\n");
  const names: string[] = [];

  for (const match of text.matchAll(/\bdef\s+([A-Za-z_]\w*)\s*\(/g)) {
    names.push(match[1]);
  }
  for (const match of text.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)) {
    const name = match[1];
    if (
      ![
        "str",
        "u256",
        "len",
        "json",
        "append",
        "get",
        "return",
        "assert",
      ].includes(name)
    ) {
      names.push(name);
    }
  }
  for (const match of text.matchAll(/\b([a-z][A-Za-z0-9_]*_[A-Za-z0-9_]+)\b/g)) {
    const name = match[1];
    if (new RegExp(`\\bdef\\s+${name}\\s*\\(`).test(content.starterCode)) {
      names.push(name);
    }
  }

  return unique(names).filter((name) => !name.startsWith("__"));
}

function collectConcepts(snippets: string[]) {
  return unique(
    snippets.filter((snippet) => {
      if (snippet.length < 4) return false;
      if (/^[A-Za-z_]\w*\(\)$/.test(snippet)) return false;
      return (
        snippet.includes(":") ||
        snippet.includes("=") ||
        snippet.includes(".") ||
        snippet.includes("@") ||
        snippet.includes("[") ||
        snippet.includes("]")
      );
    })
  );
}

function collectDecorators(snippets: string[]) {
  return unique(
    snippets
      .filter((snippet) => snippet.startsWith("@gl.public."))
      .map((snippet) => snippet.split(/\s+/)[0])
  );
}

export function getEffectiveStaticChecks(
  content: LessonContent,
  baseChecks: StaticChecks = {}
): StaticChecks {
  const snippets = collectBacktickSnippets(content);
  const taskCodeLines = collectTaskCodeLines(content);
  const requiredMethods = unique([
    ...(baseChecks.requiredMethods ?? []),
    ...collectMethodNames(content, snippets),
  ]);
  const requiredDecorators = unique([
    ...(baseChecks.requiredDecorators ?? []),
    ...collectDecorators(snippets),
  ]);
  const requiredConcepts = unique([
    ...(baseChecks.requiredConcepts ?? []),
    ...collectConcepts(snippets),
    ...collectConcepts(taskCodeLines),
  ]);

  if (
    requiredMethods.length === 0 &&
    requiredDecorators.length === 0 &&
    requiredConcepts.length === 0
  ) {
    const publicMethods = [
      ...content.starterCode.matchAll(/^\s{4}def\s+([A-Za-z_]\w*)\s*\(/gm),
    ].map((match) => match[1]);
    const lastPublicMethod = publicMethods.at(-1);
    if (lastPublicMethod) requiredMethods.push(lastPublicMethod);
  }

  return {
    ...baseChecks,
    requiredMethods,
    requiredDecorators,
    requiredConcepts,
  };
}

function findMethodRange(lines: string[], method: string) {
  const defIndex = lines.findIndex((line) =>
    new RegExp(`^\\s{4}def\\s+${method}\\s*\\(`).test(line)
  );
  if (defIndex < 0) return null;

  let start = defIndex;
  while (start > 0) {
    const previous = lines[start - 1];
    if (previous.trim() === "" || previous.trim().startsWith("@")) {
      start--;
      continue;
    }
    break;
  }

  let end = defIndex + 1;
  while (end < lines.length) {
    const line = lines[end];
    if (line.trim() !== "" && /^\s{4}\S/.test(line)) break;
    end++;
  }

  return { start, end };
}

function removeMethod(code: string, method: string) {
  const lines = code.split(/\r?\n/);
  const range = findMethodRange(lines, method);
  if (!range) return null;
  lines.splice(range.start, range.end - range.start);
  return lines.join("\n").replace(/\n{4,}/g, "\n\n\n");
}

function removeConceptLine(code: string, concept: string) {
  const lines = code.split(/\r?\n/);
  const normalizedConcept = concept.replace(/\s+/g, "");
  const index = lines.findIndex((line) =>
    line.replace(/\s+/g, "").includes(normalizedConcept)
  );
  if (index < 0) return null;
  lines.splice(index, 1);
  return lines.join("\n");
}

function redactCompletedStarter(code: string, checks: StaticChecks) {
  const methods = [...(checks.requiredMethods ?? [])].reverse();
  for (const method of methods) {
    const redacted = removeMethod(code, method);
    if (redacted) return redacted;
  }

  const concepts = [...(checks.requiredConcepts ?? [])].reverse();
  for (const concept of concepts) {
    const redacted = removeConceptLine(code, concept);
    if (redacted) return redacted;
  }

  return code;
}

export function prepareLessonContentForStudent(
  content: LessonContent,
  spec: VerificationSpec | null
): LessonContent {
  const effectiveChecks = getEffectiveStaticChecks(
    content,
    spec?.staticChecks ?? {}
  );
  const staticResult = runStaticVerification(content.starterCode, effectiveChecks);

  if (!staticResult.passed) return content;

  const starterCode = redactCompletedStarter(content.starterCode, effectiveChecks);
  if (starterCode === content.starterCode) return content;

  return {
    ...content,
    starterCode,
    expectedCode: content.expectedCode ?? content.starterCode,
  };
}
