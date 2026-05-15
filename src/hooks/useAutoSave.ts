"use client";

import { useEffect, useRef, useCallback } from "react";

export function useAutoSave(
  lessonId: number,
  code: string,
  delayMs = 30000
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeRef = useRef(code);
  codeRef.current = code;

  const save = useCallback(async () => {
    await fetch(`/api/progress/${lessonId}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeRef.current }),
    });
  }, [lessonId]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code, delayMs, save]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        `/api/progress/${lessonId}/draft`,
        JSON.stringify({ code: codeRef.current })
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [lessonId]);
}
