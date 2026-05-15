import { getContent as _getContent } from "@/content/lessons";
import type { LessonContent } from "@/types/content";

type ProjectPath = Parameters<typeof _getContent>[1];

export async function getContent(
  lessonId: number,
  projectPath: string
): Promise<LessonContent> {
  return _getContent(lessonId, projectPath as ProjectPath);
}
