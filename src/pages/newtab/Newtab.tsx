import { useState, useMemo, useEffect, type ChangeEvent } from 'react';
import '@pages/newtab/Newtab.css';

type Project = {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
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

const formatTimestamp = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear().toString().slice(-2);
  const minutes = pad(date.getMinutes());

  return `${month}-${day}-${year} ${displayHours}:${minutes} ${period}`;
};

const initialProjects: Project[] = [
  {
    id: 'project-pal',
    name: 'Project Pal',
    description:
      'Browser extension that helps teams track projects, capture context, and surface next steps during daily work.',
    lastUpdated: formatTimestamp(new Date()),
    techStack: ['React', 'TypeScript', 'Vite', 'Tailwind'],
    userStories: [
      'As a user, I can create a new workspace in one click.',
      'As a contributor, I can see project health at a glance.',
    ],
  },
  {
    id: 'impact-hub',
    name: 'Impact Hub',
    description:
      'Internal platform that centralizes portfolio projects, timelines, and outcomes to help leadership make faster decisions.',
    lastUpdated: formatTimestamp(new Date()),
    techStack: ['Svelte', 'Node.js', 'Postgres'],
    userStories: [
      'As a team lead, I can assign tasks from a project board.',
      'As a user, I can filter tasks by status and owner.',
    ],
  },
  {
    id: 'storycraft',
    name: 'StoryCraft',
    description:
      'Program storytelling toolkit that turns qualitative feedback into shareable narratives and reports.',
    lastUpdated: formatTimestamp(new Date()),
    techStack: ['Vue', 'Pinia', 'Firebase'],
    userStories: [
      'As a user, I can invite teammates via email.',
      'As a user, I can receive notifications for updates.',
    ],
  },
];

const emptyFormValues: ProjectFormValues = {
  id: '',
  name: '',
  description: '',
  techStackInput: '',
  userStoriesInput: '',
};

const parseCommaList = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseLineList = (value: string) =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);

export default function Newtab() {
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formValues, setFormValues] = useState<ProjectFormValues>(emptyFormValues);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return projectList;
    }
    return projectList.filter((project) =>
      `${project.name} ${project.description}`.toLowerCase().includes(query)
    );
  }, [projectList, searchQuery]);

  const updateFormField = (field: keyof ProjectFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const openCreateForm = () => {
    setFormMode('create');
    setFormValues(emptyFormValues);
    setIsFormOpen(true);
  };

  const openEditForm = (project: Project) => {
    setFormMode('edit');
    setFormValues({
      id: project.id,
      name: project.name,
      description: project.description,
      techStackInput: project.techStack.join(', '),
      userStoriesInput: project.userStories.join('\n'),
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
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
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

    if (formMode === 'create') {
      const newProject: Project = {
        id: `project-${Date.now().toString(36)}`,
        name: trimmedName,
        description: trimmedDescription,
        lastUpdated: formatTimestamp(new Date()),
        techStack,
        userStories,
      };
      setProjectList((prev) => [newProject, ...prev]);
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Portfolio Workspace</p>
          <h1 className="text-4xl font-semibold tracking-wide text-gray-100 mt-1">Project Pal</h1>
          <p className="text-gray-400 mt-2">Manage your projects, track progress, and collaborate effectively</p>
        </div>

        {/* Search and Add */}
        <div className="flex items-center gap-4 mb-8">
          <input
            className="flex-1 rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search projects..."
          />
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-gray-500 text-2xl font-semibold text-gray-200 transition hover:border-gray-300 hover:bg-gray-800"
            onClick={openCreateForm}
            aria-label="Add project"
            title="Add project"
          >
            +
          </button>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {formMode === 'create' ? 'Add Project' : 'Edit Project'}
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-200 text-2xl"
                  onClick={() => setIsFormOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-gray-400">Name</span>
                  <input
                    className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
                    value={formValues.name}
                    onChange={updateFormField('name')}
                    placeholder="Project name"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-gray-400">Description</span>
                  <textarea
                    className="min-h-[80px] rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
                    value={formValues.description}
                    onChange={updateFormField('description')}
                    placeholder="Short summary"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-gray-400">Tech Stack</span>
                  <input
                    className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
                    value={formValues.techStackInput}
                    onChange={updateFormField('techStackInput')}
                    placeholder="React, TypeScript, ..."
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wider text-gray-400">User Stories</span>
                  <textarea
                    className="min-h-[100px] rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100"
                    value={formValues.userStoriesInput}
                    onChange={updateFormField('userStoriesInput')}
                    placeholder="One story per line"
                  />
                </label>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center">
            <p className="text-gray-400 mb-4">No projects yet</p>
            <button
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400"
              onClick={openCreateForm}
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-gray-800 bg-gray-950/40 p-4 hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100 break-words">{project.name}</h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">{project.description}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-3">Updated: {project.lastUpdated}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-gray-800 bg-gray-900 px-2 py-1 text-[10px] font-medium text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* User Stories Preview */}
                {project.userStories.length > 0 && (
                  <div className="mb-3 text-xs text-gray-400">
                    <p className="font-semibold mb-1">{project.userStories.length} user stories</p>
                    <p className="line-clamp-1">{project.userStories[0]}</p>
                  </div>
                )}

                {/* Expanded Details */}
                {expandedProjectId === project.id && (
                  <div className="border-t border-gray-800 pt-3 mt-3 text-sm text-gray-300">
                    {project.userStories.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-gray-200 uppercase text-xs tracking-wider mb-2">User Stories</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {project.userStories.map((story) => (
                            <li key={story} className="text-gray-400">
                              {story}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="flex-1 rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 transition hover:border-gray-500 hover:text-white"
                    onClick={() =>
                      setExpandedProjectId(expandedProjectId === project.id ? null : project.id)
                    }
                  >
                    {expandedProjectId === project.id ? 'Collapse' : 'Details'}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
