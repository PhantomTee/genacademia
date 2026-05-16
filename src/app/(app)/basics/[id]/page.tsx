import { notFound } from "next/navigation";
import { getBasicsLesson, BASICS_LESSONS } from "@/content/basics/lessons";
import { BasicsShell } from "@/components/basics/BasicsShell";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default function BasicsLessonPage({ params }: Props) {
  const id = parseInt(params.id, 10);
  const lesson = getBasicsLesson(id);
  if (!lesson) notFound();

  const prev = id > 1 ? id - 1 : null;
  const next = id < BASICS_LESSONS.length ? id + 1 : null;

  return <BasicsShell lesson={lesson} prev={prev} next={next} />;
}
