import type { ChangeEvent } from "react";

import type { ProjectFormValues } from "./ProjectTypes";

type AiProjectOption = {
  name: string;
  description: string;
  techStack: string[];
  userStories: string[];
};

type ProjectFormProps = {
  formMode: "create" | "edit";
  formValues: ProjectFormValues;
  aiMode: boolean;
  aiSummary: string;
  aiOptions: AiProjectOption[];
  isGeneratingOptions: boolean;
  aiError: string | null;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (field: keyof ProjectFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onToggleAiMode: () => void;
  onAiSummaryChange: (value: string) => void;
  onGenerateOptions: () => void;
  onSelectOption: (option: AiProjectOption) => void;
};

export default function ProjectForm({
  formMode,
  formValues,
  aiMode,
  aiSummary,
  aiOptions,
  isGeneratingOptions,
  aiError,
  onClose,
  onSave,
  onFieldChange,
  onToggleAiMode,
  onAiSummaryChange,
  onGenerateOptions,
  onSelectOption,
}: ProjectFormProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-gray-800 bg-gray-950/40 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {formMode === "create" ? "Add Project" : "Edit Project"}
        </h2>
        <div className="flex items-center gap-2">
          {formMode === "create" && (
            <button
              className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
              onClick={onToggleAiMode}
            >
              {aiMode ? "Manual" : "AI"}
            </button>
          )}
          <button
            className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      {aiMode && formMode === "create" ? (
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wider text-gray-400">Project Summary</span>
            <textarea
              className="min-h-[96px] rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              value={aiSummary}
              onChange={(event) => onAiSummaryChange(event.target.value)}
              placeholder="Describe the project, goals, users, and constraints"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onGenerateOptions}
              disabled={!aiSummary.trim() || isGeneratingOptions}
            >
              {isGeneratingOptions ? "Generating..." : "Generate Options"}
            </button>
            {aiError && <span className="text-xs text-rose-300">{aiError}</span>}
          </div>
          {aiOptions.length > 0 && (
            <div className="space-y-2">
              {aiOptions.map((option, index) => (
                <button
                  key={`${option.name}-${index}`}
                  className="w-full rounded-2xl border border-gray-800 bg-gray-900/60 p-3 text-left transition hover:border-gray-600"
                  onClick={() => onSelectOption(option)}
                >
                  <p className="text-sm font-semibold text-gray-100">{option.name}</p>
                  <p className="mt-1 text-xs text-gray-300">{option.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {option.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-gray-800 bg-gray-950 px-2 py-1 text-[10px] font-medium text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wider text-gray-400">Name</span>
            <input
              className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              value={formValues.name}
              onChange={onFieldChange("name")}
              placeholder="Project name"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wider text-gray-400">Description</span>
            <textarea
              className="min-h-[72px] rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              value={formValues.description}
              onChange={onFieldChange("description")}
              placeholder="Short summary"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wider text-gray-400">Tech Stack</span>
            <input
              className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              value={formValues.techStackInput}
              onChange={onFieldChange("techStackInput")}
              placeholder="React, TypeScript, ..."
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wider text-gray-400">User Stories</span>
            <textarea
              className="min-h-[96px] rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              value={formValues.userStoriesInput}
              onChange={onFieldChange("userStoriesInput")}
              placeholder="One story per line"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400"
              onClick={onSave}
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}
