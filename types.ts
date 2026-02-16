
export interface JobDescription {
  id: string;
  title: string;
  department: string;
  content: string;
  skills: string[];
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  resumeText: string;
  score: number;
  status: 'new' | 'screened' | 'rejected' | 'shortlisted';
  evaluation?: {
    summary: string;
    pros: string[];
    cons: string[];
    matchPercentage: number;
    recommendedQuestions: string[];
  };
}

export interface AppState {
  jobs: JobDescription[];
  candidates: Candidate[];
  activeJobId: string | null;
}
