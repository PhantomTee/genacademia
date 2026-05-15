"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { CodeEditor } from "./CodeEditor";
import { ContentRenderer } from "./ContentRenderer";
import { DeployPanel } from "./DeployPanel";
import { VerifyPanel } from "./VerifyPanel";
import { HintsPanel } from "./HintsPanel";
import { CheatsheetPanel } from "./CheatsheetPanel";
import { NetworkBanner } from "@/components/NetworkBanner";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { LessonContent } from "@/types/content";
import type { LessonMeta } from "@/lib/curriculum/metadata";

type Tab = "deploy" | "verify" | "hints" | "cheatsheet";

interface Props {
  lesson: LessonMeta;
  content: LessonContent;
}

export function LessonShell({ lesson, content }: Props) {
  useSession();
  const [code, setCode] = useState(content.starterCode);
  const [activeTab, setActiveTab] = useState<Tab>("deploy");
  const [contractAddress, setContractAddress] = useState("");
  const [hintsRevealed, setHintsRevealed] = useState<number[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);

  useAutoSave(lesson.id, code);

  useEffect(() => {
    async function loadProgress() {
      const res = await fetch(`/api/progress/${lesson.id}`);
      const data = await res.json();
      if (data.progress) {
        if (data.progress.editorDraft) setCode(data.progress.editorDraft);
        if (data.progress.contractAddress)
          setContractAddress(data.progress.contractAddress);
        if (data.progress.hintsRevealed)
          setHintsRevealed(data.progress.hintsRevealed);
      }
      setProgressLoaded(true);
    }
    loadProgress();
  }, [lesson.id]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "deploy", label: "Deploy" },
    { id: "verify", label: "Verify" },
    { id: "hints", label: "Hints" },
    { id: "cheatsheet", label: "Cheat Sheet" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <NetworkBanner />

      {/* Desktop: resizable 3-panel layout */}
      <div className="hidden md:flex flex-1 min-h-0">
        <Group orientation="horizontal" className="flex-1 flex min-h-0">
          {/* Left: lesson content */}
          <Panel defaultSize="38" minSize="20" className="overflow-hidden border-r border-ink/15 dark:border-cream-200/15">
            <ContentRenderer
              explanation={content.explanation}
              task={content.task}
              docUrl={lesson.docUrl}
            />
          </Panel>

          <Separator
            className="w-1.5 bg-ink/10 dark:bg-cream-200/10 hover:bg-ink/30 dark:hover:bg-cream-200/30 transition-colors cursor-col-resize"
          />

          {/* Right: editor + tabs */}
          <Panel defaultSize="62" minSize="30">
            <Group orientation="vertical" className="flex flex-col h-full">
              {/* Editor */}
              <Panel defaultSize="65" minSize="25" className="min-h-0 border-b border-ink/15 dark:border-cream-200/15">
                {progressLoaded && (
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    starterCode={content.starterCode}
                  />
                )}
              </Panel>

              <Separator
                className="h-1.5 bg-ink/10 dark:bg-cream-200/10 hover:bg-ink/30 dark:hover:bg-cream-200/30 transition-colors cursor-row-resize"
              />

              {/* Tab panel */}
              <Panel defaultSize="35" minSize="15" className="flex flex-col min-h-0">
                <div className="flex border-b border-ink/15 dark:border-cream-200/15 bg-cream-200 dark:bg-ink flex-shrink-0">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-ink dark:text-cream-200 border-b-2 border-ink dark:border-cream-200 bg-ink/5 dark:bg-cream-200/5"
                          : "text-ink/40 dark:text-cream-200/40 hover:text-ink dark:hover:text-cream-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  {activeTab === "deploy" && (
                    <DeployPanel
                      lessonId={lesson.id}
                      code={code}
                      onDeployed={(addr) => {
                        setContractAddress(addr);
                        setActiveTab("verify");
                      }}
                    />
                  )}
                  {activeTab === "verify" && (
                    <VerifyPanel
                      lessonId={lesson.id}
                      contractAddress={contractAddress}
                      code={code}
                      onAddressChange={setContractAddress}
                    />
                  )}
                  {activeTab === "hints" && (
                    <HintsPanel
                      lessonId={lesson.id}
                      hints={content.hints}
                      revealed={hintsRevealed}
                      onReveal={(idx) => {
                        const next = [...hintsRevealed, idx];
                        setHintsRevealed(next);
                      }}
                    />
                  )}
                  {activeTab === "cheatsheet" && (
                    <CheatsheetPanel currentLessonId={lesson.id} />
                  )}
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      {/* Mobile: vertical stack */}
      <div className="md:hidden flex flex-col flex-1 overflow-y-auto">
        <ContentRenderer
          explanation={content.explanation}
          task={content.task}
          docUrl={lesson.docUrl}
        />
        <div className="h-80 border-y border-ink/15 dark:border-cream-200/15">
          {progressLoaded && (
            <CodeEditor
              value={code}
              onChange={setCode}
              starterCode={content.starterCode}
            />
          )}
        </div>
        <div className="flex border-b border-ink/15 dark:border-cream-200/15 bg-cream-200 dark:bg-ink">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-medium ${
                activeTab === tab.id ? "text-white bg-ink/5 dark:bg-cream-200/5" : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          {activeTab === "deploy" && (
            <DeployPanel
              lessonId={lesson.id}
              code={code}
              onDeployed={(addr) => {
                setContractAddress(addr);
                setActiveTab("verify");
              }}
            />
          )}
          {activeTab === "verify" && (
            <VerifyPanel
              lessonId={lesson.id}
              contractAddress={contractAddress}
              code={code}
              onAddressChange={setContractAddress}
            />
          )}
          {activeTab === "hints" && (
            <HintsPanel
              lessonId={lesson.id}
              hints={content.hints}
              revealed={hintsRevealed}
              onReveal={(idx) => setHintsRevealed([...hintsRevealed, idx])}
            />
          )}
          {activeTab === "cheatsheet" && (
            <CheatsheetPanel currentLessonId={lesson.id} />
          )}
        </div>
      </div>
    </div>
  );
}
