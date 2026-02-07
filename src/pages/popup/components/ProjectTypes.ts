export type Project = {
  id: string;
  name: string;
  description: string;
  nextDeadline: string;
  lastUpdated: string;
  riskScore?: number;
  readinessScore?: number;
  riskBreakdown?: Array<{
    dimension: string;
    score: number;
    why: string;
  }>;
  techStack: string[];
  userStories: string[];
};

export type ProjectFormValues = {
  id: string;
  name: string;
  description: string;
  nextDeadline: string;
  techStackInput: string;
  userStoriesInput: string;
};
