import type { Project } from "./ProjectTypes";

type ProjectDetailProps = {
  project: Project;
  storyDraft: string;
  isGenerating: boolean;
  aiError: string | null;
  aiFeedback: string | undefined;
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
  aiFeedback,
  onBack,
  onEdit,
  onDelete,
  onStoryDraftChange,
  onGenerateFeedback,
}: ProjectDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold break-words">{project.name}</h2>
        <p className="mt-1 text-sm text-gray-300 break-words">{project.description}</p>
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
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Previous User Stories</h3>
        <ul className="mt-2 list-disc space-y-2 pl-4 text-sm text-gray-200">
          {project.userStories.map((story) => (
            <li key={story}>{story}</li>
          ))}
        </ul>
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
        {aiFeedback && (
          <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900/70 p-3 text-sm text-gray-200">
            <p className="text-xs uppercase tracking-wider text-gray-400">AI Feedback</p>
            <div className="mt-2 whitespace-pre-wrap">{aiFeedback}</div>
          </div>
        )}
      </div>
    </div>
  );
}
