import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLesson, type ProjectPath } from "@/lib/curriculum/metadata";
import { getSpec } from "@/lib/curriculum/specs";
import { getContent } from "@/lib/content/loader";
import { prepareLessonContentForStudent } from "@/lib/content/student-starter";
import { LessonShell } from "@/components/lesson/LessonShell";

export async function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ id: String(i + 1) }));
}

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const lessonId = parseInt(params.id, 10);

  if (isNaN(lessonId) || lessonId < 1 || lessonId > 30) notFound();

  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  const projectPath = session!.user.projectPath as ProjectPath;

  const [rawContent, rawPrevContent, spec, prevSpec] = await Promise.all([
    getContent(lessonId, projectPath),
    lessonId > 1 ? getContent(lessonId - 1, projectPath).catch(() => null) : Promise.resolve(null),
    getSpec(lessonId, projectPath),
    lessonId > 1 ? getSpec(lessonId - 1, projectPath).catch(() => null) : Promise.resolve(null),
  ]);

  const content = prepareLessonContentForStudent(rawContent, spec);
  const prevContent = rawPrevContent
    ? prepareLessonContentForStudent(rawPrevContent, prevSpec)
    : null;
  const prevCode = prevContent?.expectedCode ?? prevContent?.starterCode;

  return <LessonShell lesson={lesson} content={content} prevCode={prevCode} />;
}
