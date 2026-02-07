import { useMemo, useState } from "react";

import type { Project } from "./ProjectTypes";

type ProjectDetailProps = {
  project: Project;
  storyDraft: string;
  isGenerating: boolean;
  aiError: string | null;
  aiFeedbackByStory: Record<string, string>;
  isGeneratingRisk: boolean;
  riskError: string | null;
  onGenerateRisk: () => void;
  onBack: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onStoryDraftChange: (value: string) => void;
  onGenerateFeedback: () => void;
};

export default function ProjectDetail({
  project,
  storyDraft,
  isGenerating,
  aiError,
  aiFeedbackByStory,
  isGeneratingRisk,
  riskError,
  onGenerateRisk,
  onBack,
  onEdit,
  onDelete,
  onStoryDraftChange,
  onGenerateFeedback,
}: ProjectDetailProps) {
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const normalizeStoryKey = (value: string) => value.trim();

  const normalizedFeedback = useMemo(() => {
    const cleaned: Record<string, string> = {};
    Object.entries(aiFeedbackByStory).forEach(([story, feedback]) => {
      cleaned[story] = feedback.replace(/\*\*/g, "").trim();
    });
    return cleaned;
  }, [aiFeedbackByStory]);

  const renderFeedback = (feedback: string) => {
    const lines = feedback
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const goodItems: string[] = [];
    const changeItems: string[] = [];
    const otherItems: string[] = [];
    let improvedStory = "";

    lines.forEach((line) => {
      const normalizedLine = line.replace(/^\*+|\*+$/g, "").trim();
      const isBullet = normalizedLine.startsWith("-");
      const content = isBullet ? normalizedLine.replace(/^-\s+/, "") : normalizedLine;
      const lower = content.toLowerCase();

      if (lower.startsWith("improved story")) {
        const parts = content.split(":");
        improvedStory = parts.slice(1).join(":").trim() || improvedStory;
        return;
      }

      if (lower.startsWith("what is good")) {
        const parts = content.split(":");
        const detail = parts.slice(1).join(":").trim();
        if (detail) {
          goodItems.push(detail);
        }
        return;
      }

      if (lower.startsWith("what to change")) {
        const parts = content.split(":");
        const detail = parts.slice(1).join(":").trim();
        if (detail) {
          changeItems.push(detail);
        }
        return;
      }

      if (isBullet) {
        otherItems.push(content);
      } else if (content) {
        otherItems.push(content);
      }
    });

    return (
      <div className="space-y-3">
        {goodItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">What is good</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-gray-200">
              {goodItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {changeItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">What to change</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-gray-200">
              {changeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {otherItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">Notes</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-gray-200">
              {otherItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {improvedStory && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Improved Story</p>
            <p className="mt-2 text-sm text-gray-200">{improvedStory}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold break-words">{project.name}</h2>
        <p className="mt-1 text-sm text-gray-300 break-words">{project.description}</p>
        <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
          Next deadline: {project.nextDeadline || "Not set"}
        </p>
        <p className="mt-2 text-xs uppercase tracking-wider text-gray-500">
          Last updated: {project.lastUpdated}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className="rounded-xl border border-gray-700 px-3 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
            onClick={onBack}
          >
            Back
          </button>
          <button
            className="rounded-xl border border-gray-700 px-3 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
            onClick={() => onEdit(project)}
          >
            Edit
          </button>
          <button
            className="rounded-xl border border-rose-400/60 px-3 py-1 text-xs text-rose-300 transition hover:border-rose-300 hover:text-rose-200"
            onClick={() => onDelete(project.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Tech Stack</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-xs font-medium text-gray-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Risk & Readiness</h3>
            <p className="mt-2 text-sm text-gray-200">
              Risk: {project.riskScore ?? "-"} / 100
            </p>
            <p className="text-sm text-gray-200">
              Readiness: {project.readinessScore ?? "-"} / 100
            </p>
          </div>
          <button
            className="rounded-xl border border-gray-700 px-3 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
            onClick={onGenerateRisk}
            disabled={isGeneratingRisk}
          >
            {isGeneratingRisk ? "Scoring..." : "Generate"}
          </button>
        </div>
        {riskError && <p className="mt-2 text-xs text-rose-300">{riskError}</p>}
        {project.riskBreakdown && project.riskBreakdown.length > 0 && (
          <div className="mt-3">
            <button
              className="text-xs uppercase tracking-wider text-gray-400 transition hover:text-gray-200"
              onClick={() => setIsBreakdownOpen((prev) => !prev)}
            >
              {isBreakdownOpen ? "Hide Breakdown" : "Show Breakdown"}
            </button>
            {isBreakdownOpen && (
              <div className="mt-3 space-y-2 text-sm text-gray-200">
                {project.riskBreakdown.map((item) => (
                  <div key={item.dimension} className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                        {item.dimension}
                      </p>
                      <span className="text-xs text-gray-400">{item.score}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-200">{item.why}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Previous User Stories</h3>
        <div className="mt-3 flex flex-col gap-2">
          {project.userStories.map((story) => {
            const storyKey = normalizeStoryKey(story);
            const feedback = normalizedFeedback[storyKey];
            const isExpanded = expandedStory === storyKey;

            return (
              <div key={story} className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-gray-200 break-words">{story}</p>
                  {feedback && (
                    <button
                      className="rounded-full border border-gray-700 p-2 text-gray-300 transition hover:border-gray-500 hover:text-white"
                      onClick={() => setExpandedStory(isExpanded ? null : storyKey)}
                      title="View AI feedback"
                      aria-label="View AI feedback"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  )}
                </div>
                {isExpanded && (
                  <div className="mt-3 rounded-xl border border-gray-800 bg-gray-950/60 p-3 text-sm text-gray-200">
                    {feedback ? renderFeedback(feedback) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
          Add User Story + AI Feedback
        </h3>
        <textarea
          className="mt-2 min-h-[84px] w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
          value={storyDraft}
          onChange={(event) => onStoryDraftChange(event.target.value)}
          placeholder="As a user, I want to..."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onGenerateFeedback}
            disabled={!storyDraft.trim() || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Feedback"}
          </button>
          {aiError && <span className="text-xs text-rose-300">{aiError}</span>}
        </div>
      </div>
    </div>
  );
}
