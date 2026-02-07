export type Project = {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  techStack: string[];
  userStories: string[];
};

export type ProjectFormValues = {
  id: string;
  name: string;
  description: string;
  techStackInput: string;
  userStoriesInput: string;
};
