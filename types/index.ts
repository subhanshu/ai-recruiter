export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens?: number
  type: string
  response?: {
    usage: {
      total_tokens: number
      input_tokens: number
      output_tokens: number
    }
  }
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  status: string;
  location?: string;
  skills?: string; // JSON string of skills array
  experience?: string;
  education?: string;
  summary?: string;
  workHistory?: string; // JSON string of work history
  projects?: string; // JSON string of projects
  certifications?: string; // JSON string of certifications
  languages?: string; // JSON string of languages
  createdAt: string;
  jobId: string;
}

// Parsed candidate data (for UI display)
export interface ParsedCandidate extends Omit<Candidate, 'skills' | 'workHistory' | 'projects' | 'certifications' | 'languages'> {
  skills?: string[];
  workHistory?: WorkHistory[];
  projects?: Project[];
  certifications?: string[];
  languages?: string[];
}

// Work history entry
export interface WorkHistory {
  company: string;
  position: string;
  duration: string;
  description: string;
}

// Project entry
export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

// Skills matching result
export interface SkillsMatch {
  totalSkills: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
}

// Candidate ranking
export interface CandidateRanking {
  candidateId: string;
  overallScore: number;
  skillsMatch: SkillsMatch;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  summary: string;
} 