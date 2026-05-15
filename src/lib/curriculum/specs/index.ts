import type { ProjectPath } from "@/lib/curriculum/metadata";
import type { VerificationSpec } from "@/lib/genlayer/verify";

export type { VerificationSpec };

export type LessonSpecs = Record<ProjectPath, VerificationSpec>;

const specCache: Record<number, LessonSpecs> = {};

export async function getSpec(
  lessonId: number,
  projectPath: ProjectPath
): Promise<VerificationSpec | null> {
  if (!specCache[lessonId]) {
    try {
      const mod = await import(`./${String(lessonId).padStart(2, "0")}`);
      specCache[lessonId] = mod.specs;
    } catch {
      return null;
    }
  }
  return specCache[lessonId]?.[projectPath] ?? null;
}

const SHAPE_LABELS: Record<string, string> = {
  nonEmpty: "non-empty value",
  exact: "exact value",
  custom: "custom check",
};

export async function getHumanSpec(
  lessonId: number,
  projectPath: ProjectPath
): Promise<{ method: string; humanExpected: string } | null> {
  const spec = await getSpec(lessonId, projectPath);
  if (!spec) return null;
  return {
    method: spec.method,
    humanExpected: SHAPE_LABELS[spec.expectedShape] ?? spec.expectedShape,
  };
}
