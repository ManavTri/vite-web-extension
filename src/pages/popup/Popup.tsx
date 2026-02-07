import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type Project = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  userStories: string[];
};

type ProjectFormValues = {
  id: string;
  name: string;
  description: string;
  techStackInput: string;
  userStoriesInput: string;
};

const initialProjects: Project[] = [
  {
    id: "project-pal",
    name: "Project Pal",
    description:
      "Browser extension that helps teams track projects, capture context, and surface next steps during daily work.",
    techStack: ["React", "TypeScript", "Vite", "Tailwind"],
    userStories: [
      "As a user, I can create a new workspace in one click.",
      "As a contributor, I can see project health at a glance.",
    ],
  },
  {
    id: "impact-hub",
    name: "Impact Hub",
    description:
      "Internal platform that centralizes portfolio projects, timelines, and outcomes to help leadership make faster decisions.",
    techStack: ["Svelte", "Node.js", "Postgres"],
    userStories: [
      "As a team lead, I can assign tasks from a project board.",
      "As a user, I can filter tasks by status and owner.",
    ],
  },
  {
    id: "storycraft",
    name: "StoryCraft",
    description:
      "Program storytelling toolkit that turns qualitative feedback into shareable narratives and reports.",
    techStack: ["Vue", "Pinia", "Firebase"],
    userStories: [
      "As a user, I can invite teammates via email.",
      "As a user, I can receive notifications for updates.",
    ],
  },
];

const emptyFormValues: ProjectFormValues = {
  id: "",
  name: "",
  description: "",
  techStackInput: "",
  userStoriesInput: "",
};

const parseCommaList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseLineList = (value: string) =>
  value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);

export default function Popup() {
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<ProjectFormValues>(emptyFormValues);
  const [storyDraft, setStoryDraft] = useState("");
  const [aiFeedbackByProjectId, setAiFeedbackByProjectId] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const activeProject = useMemo(
    () => projectList.find((project) => project.id === activeProjectId) ?? null,
    [projectList, activeProjectId]
  );

  useEffect(() => {
    setStoryDraft("");
    setAiError(null);
  }, [activeProjectId]);

  const updateFormField = (field: keyof ProjectFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const openCreateForm = () => {
    setFormMode("create");
    setFormValues(emptyFormValues);
    setIsFormOpen(true);
  };

  const openEditForm = (project: Project) => {
    setFormMode("edit");
    setFormValues({
      id: project.id,
      name: project.name,
      description: project.description,
      techStackInput: project.techStack.join(", "),
      userStoriesInput: project.userStories.join("\n"),
    });
    setIsFormOpen(true);
  };

  const handleDelete = (projectId: string) => {
    const project = projectList.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    if (!window.confirm(`Delete ${project.name}?`)) {
      return;
    }

    setProjectList((prev) => prev.filter((item) => item.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const handleSave = () => {
    const trimmedName = formValues.name.trim();
    if (!trimmedName) {
      return;
    }

    const trimmedDescription = formValues.description.trim();
    const techStack = parseCommaList(formValues.techStackInput);
    const userStories = parseLineList(formValues.userStoriesInput);

    if (formMode === "create") {
      const newProject: Project = {
        id: `project-${Date.now().toString(36)}`,
        name: trimmedName,
        description: trimmedDescription,
        techStack,
        userStories,
      };
      setProjectList((prev) => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
    } else {
      setProjectList((prev) =>
        prev.map((project) =>
          project.id === formValues.id
            ? {
                ...project,
                name: trimmedName,
                description: trimmedDescription,
                techStack,
                userStories,
              }
            : project
        )
      );
    }

    setIsFormOpen(false);
  };

  const handleGenerateStoryFeedback = async () => {
    if (!activeProject) {
      return;
    }

    const trimmedStory = storyDraft.trim();
    if (!trimmedStory || isGenerating) {
      return;
    }

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
    if (!apiKey) {
      setAiError("Missing OpenRouter API key. Set VITE_OPENROUTER_API_KEY in your env.");
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    const prompt = [
      `Project: ${activeProject.name}`,
      `Description: ${activeProject.description}`,
      `Tech Stack: ${activeProject.techStack.join(", ") || "N/A"}`,
      `Existing User Stories: ${activeProject.userStories.join(" | ") || "N/A"}`,
      `New User Story: ${trimmedStory}`,
      "",
      "Provide feedback on the new user story using this format:",
      "- Improved Story (if needed)",
      "- Acceptance Criteria (3-5 bullets)",
      "- Edge Cases (2-4 bullets)",
      "- Implementation Notes (2-4 bullets)"
    ].join("\n");

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "Project Pal"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a senior product manager who reviews user stories for clarity and completeness."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 450
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error("OpenRouter returned an empty response.");
      }

      setAiFeedbackByProjectId((prev) => ({ ...prev, [activeProject.id]: content }));
      setProjectList((prev) =>
        prev.map((project) =>
          project.id === activeProject.id
            ? {
                ...project,
                userStories: project.userStories.includes(trimmedStory)
                  ? project.userStories
                  : [...project.userStories, trimmedStory]
              }
            : project
        )
      );
      setStoryDraft("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAiError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-[460px] max-w-full bg-gray-900 p-3 text-gray-100">
      <div className="rounded-3xl border border-gray-800 bg-gray-950/70 p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Portfolio Workspace</p>
            <h1 className="text-xl font-semibold tracking-wide text-gray-100">Project Pal</h1>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-gray-500 text-lg font-semibold text-gray-200 transition hover:border-gray-300 hover:bg-gray-800"
            onClick={openCreateForm}
            aria-label="Add project"
            title="Add project"
          >
            +
          </button>
        </div>

        <div className="mt-3 max-h-[520px] overflow-y-auto pr-1">
          {isFormOpen ? (
            <div className="space-y-3 rounded-2xl border border-gray-800 bg-gray-950/40 p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {formMode === "create" ? "Add Project" : "Edit Project"}
              </h2>
              <button
                className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
                onClick={() => setIsFormOpen(false)}
              >
                Close
              </button>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-wider text-gray-400">Name</span>
              <input
                className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
                value={formValues.name}
                onChange={updateFormField("name")}
                placeholder="Project name"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-wider text-gray-400">Description</span>
              <textarea
                className="min-h-[72px] rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
                value={formValues.description}
                onChange={updateFormField("description")}
                placeholder="Short summary"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-wider text-gray-400">Tech Stack</span>
              <input
                className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
                value={formValues.techStackInput}
                onChange={updateFormField("techStackInput")}
                placeholder="React, TypeScript, ..."
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-wider text-gray-400">User Stories</span>
              <textarea
                className="min-h-[96px] rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
                value={formValues.userStoriesInput}
                onChange={updateFormField("userStoriesInput")}
                placeholder="One story per line"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
            </div>
          ) : activeProject ? (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold break-words">{activeProject.name}</h2>
                <p className="mt-1 text-sm text-gray-300 break-words">{activeProject.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-xl border border-gray-700 px-3 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
                    onClick={() => setActiveProjectId(null)}
                  >
                    Back
                  </button>
                  <button
                    className="rounded-xl border border-gray-700 px-3 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
                    onClick={() => openEditForm(activeProject)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-xl border border-rose-400/60 px-3 py-1 text-xs text-rose-300 transition hover:border-rose-300 hover:text-rose-200"
                    onClick={() => handleDelete(activeProject.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Tech Stack</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeProject.techStack.map((tech) => (
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
                {activeProject.userStories.map((story) => (
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
                onChange={(event) => setStoryDraft(event.target.value)}
                placeholder="As a user, I want to..."
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleGenerateStoryFeedback}
                  disabled={!storyDraft.trim() || isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Feedback"}
                </button>
                {aiError && <span className="text-xs text-rose-300">{aiError}</span>}
              </div>
              {aiFeedbackByProjectId[activeProject.id] && (
                <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900/70 p-3 text-sm text-gray-200">
                  <p className="text-xs uppercase tracking-wider text-gray-400">AI Feedback</p>
                  <div className="mt-2 whitespace-pre-wrap">
                    {aiFeedbackByProjectId[activeProject.id]}
                  </div>
                </div>
              )}
            </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {projectList.map((project) => (
                <div key={project.id} className="rounded-2xl border border-gray-800 bg-gray-950/40 p-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-100 break-words">{project.name}</h2>
                    <p className="mt-1 text-sm text-gray-300 break-words">{project.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
                        onClick={() => setActiveProjectId(project.id)}
                      >
                        Open
                      </button>
                      <button
                        className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
                        onClick={() => openEditForm(project)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-lg border border-rose-400/60 px-2 py-1 text-xs text-rose-300 transition hover:border-rose-300 hover:text-rose-200"
                        onClick={() => handleDelete(project.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-gray-800 bg-gray-900 px-2 py-1 text-[10px] font-medium text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {projectList.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-700 p-6 text-center text-sm text-gray-400">
                  No projects yet. Use the + button to add one.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
