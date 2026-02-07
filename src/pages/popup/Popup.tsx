import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import ProjectDetail from "./components/ProjectDetail";
import ProjectForm from "./components/ProjectForm";
import ProjectHeader from "./components/ProjectHeader";
import ProjectList from "./components/ProjectList";
import type { Project, ProjectFormValues } from "./components/ProjectTypes";

const formatTimestamp = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const hours = date.getHours();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear().toString().slice(-2);
  const minutes = pad(date.getMinutes());

  return `${month}-${day}-${year} ${displayHours}:${minutes} ${period}`;
};

const initialProjects: Project[] = [
  {
    id: "project-pal",
    name: "Project Pal",
    description:
      "Browser extension that helps teams track projects, capture context, and surface next steps during daily work.",
    lastUpdated: formatTimestamp(new Date()),
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
    lastUpdated: formatTimestamp(new Date()),
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
    lastUpdated: formatTimestamp(new Date()),
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
  const [searchQuery, setSearchQuery] = useState("");

  const activeProject = useMemo(
    () => projectList.find((project) => project.id === activeProjectId) ?? null,
    [projectList, activeProjectId]
  );

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return projectList;
    }
    return projectList.filter((project) =>
      `${project.name} ${project.description}`.toLowerCase().includes(query)
    );
  }, [projectList, searchQuery]);

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
        lastUpdated: formatTimestamp(new Date()),
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
                lastUpdated: formatTimestamp(new Date()),
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
                lastUpdated: formatTimestamp(new Date()),
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
        <ProjectHeader
          onAdd={openCreateForm}
          showAdd={!activeProject && !isFormOpen}
          showSearch={!activeProject && !isFormOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => setSearchQuery((prev) => prev.trim())}
        />

        <div className="mt-3">
          {isFormOpen ? (
            <ProjectForm
              formMode={formMode}
              formValues={formValues}
              onClose={() => setIsFormOpen(false)}
              onSave={handleSave}
              onFieldChange={updateFormField}
            />
          ) : activeProject ? (
            <ProjectDetail
              project={activeProject}
              storyDraft={storyDraft}
              isGenerating={isGenerating}
              aiError={aiError}
              aiFeedback={aiFeedbackByProjectId[activeProject.id]}
              onBack={() => setActiveProjectId(null)}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onStoryDraftChange={setStoryDraft}
              onGenerateFeedback={handleGenerateStoryFeedback}
            />
          ) : (
            <ProjectList
              projects={filteredProjects}
              onOpen={setActiveProjectId}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
