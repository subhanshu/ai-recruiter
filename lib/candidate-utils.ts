import { Candidate, ParsedCandidate, SkillsMatch, CandidateRanking } from '@/types';

/**
 * Parse JSON strings from candidate data into proper objects
 */
export function parseCandidateData(candidate: Candidate): ParsedCandidate {
  return {
    ...candidate,
    skills: candidate.skills ? JSON.parse(candidate.skills) : undefined,
    workHistory: candidate.workHistory ? JSON.parse(candidate.workHistory) : undefined,
    projects: candidate.projects ? JSON.parse(candidate.projects) : undefined,
    certifications: candidate.certifications ? JSON.parse(candidate.certifications) : undefined,
    languages: candidate.languages ? JSON.parse(candidate.languages) : undefined,
  };
}

/**
 * Calculate skills match between candidate and job requirements
 */
export function calculateSkillsMatch(
  candidateSkills: string[] = [],
  jobRequiredSkills: string[] = []
): SkillsMatch {
  if (jobRequiredSkills.length === 0) {
    return {
      totalSkills: 0,
      matchedSkills: [],
      missingSkills: [],
      matchPercentage: 100
    };
  }

  const normalizedCandidateSkills = candidateSkills.map(skill => skill.toLowerCase().trim());
  const normalizedJobSkills = jobRequiredSkills.map(skill => skill.toLowerCase().trim());

  const matchedSkills = normalizedJobSkills.filter(jobSkill =>
    normalizedCandidateSkills.some(candidateSkill =>
      candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
    )
  );

  const missingSkills = normalizedJobSkills.filter(jobSkill =>
    !normalizedCandidateSkills.some(candidateSkill =>
      candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
    )
  );

  const matchPercentage = (matchedSkills.length / normalizedJobSkills.length) * 100;

  return {
    totalSkills: normalizedJobSkills.length,
    matchedSkills,
    missingSkills,
    matchPercentage
  };
}

/**
 * Calculate experience score based on candidate experience and job requirements
 */
export function calculateExperienceScore(
  candidateExperience: string = '',
  jobLevel: string = ''
): number {
  if (!candidateExperience || !jobLevel) return 50;

  const experienceYears = extractYearsFromExperience(candidateExperience);
  const jobLevelYears = getJobLevelYears(jobLevel);

  if (experienceYears >= jobLevelYears) return 100;
  if (experienceYears >= jobLevelYears * 0.8) return 80;
  if (experienceYears >= jobLevelYears * 0.6) return 60;
  if (experienceYears >= jobLevelYears * 0.4) return 40;
  return 20;
}

/**
 * Extract years of experience from experience string
 */
function extractYearsFromExperience(experience: string): number {
  const match = experience.match(/(\d+(?:\.\d+)?)\s*years?/i);
  if (match) return parseFloat(match[1]);
  
  // Handle ranges like "2-3 years"
  const rangeMatch = experience.match(/(\d+)-(\d+)\s*years?/i);
  if (rangeMatch) return (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
  
  return 0;
}

/**
 * Get expected years for job level
 */
function getJobLevelYears(jobLevel: string): number {
  const level = jobLevel.toLowerCase();
  if (level.includes('senior') || level.includes('lead')) return 5;
  if (level.includes('mid') || level.includes('intermediate')) return 3;
  if (level.includes('junior') || level.includes('entry')) return 1;
  if (level.includes('intern')) return 0;
  return 3; // Default
}

/**
 * Calculate education score
 */
export function calculateEducationScore(
  candidateEducation: string = '',
  jobQualifications: string = ''
): number {
  if (!candidateEducation || !jobQualifications) return 50;

  const education = candidateEducation.toLowerCase();
  const qualifications = jobQualifications.toLowerCase();

  // Check for degree requirements
  if (qualifications.includes('phd') && education.includes('phd')) return 100;
  if (qualifications.includes('master') && education.includes('master')) return 90;
  if (qualifications.includes('bachelor') && education.includes('bachelor')) return 80;
  if (qualifications.includes('degree') && education.includes('degree')) return 70;

  return 50;
}

/**
 * Calculate location score
 */
export function calculateLocationScore(
  candidateLocation: string = '',
  jobLocation: string = ''
): number {
  if (!candidateLocation || !jobLocation) return 50;

  const candidate = candidateLocation.toLowerCase();
  const job = jobLocation.toLowerCase();

  // Exact match
  if (candidate === job) return 100;

  // Same city
  if (candidate.split(',')[0] === job.split(',')[0]) return 90;

  // Same state/region
  if (candidate.includes(job.split(',')[1]?.trim()) || job.includes(candidate.split(',')[1]?.trim())) return 70;

  // Remote work
  if (job.includes('remote') || job.includes('anywhere')) return 80;

  return 30;
}

/**
 * Calculate overall candidate ranking
 */
export function calculateCandidateRanking(
  candidate: ParsedCandidate,
  job: {
    requiredSkills?: string;
    qualifications?: string;
    location?: string;
    title?: string;
  }
): CandidateRanking {
  const skillsMatch = calculateSkillsMatch(
    candidate.skills,
    job.requiredSkills?.split(',').map(s => s.trim()) || []
  );

  const experienceScore = calculateExperienceScore(
    candidate.experience,
    job.title || ''
  );

  const educationScore = calculateEducationScore(
    candidate.education,
    job.qualifications || ''
  );

  const locationScore = calculateLocationScore(
    candidate.location,
    job.location || ''
  );

  // Weighted overall score
  const overallScore = Math.round(
    (skillsMatch.matchPercentage * 0.4) +
    (experienceScore * 0.3) +
    (educationScore * 0.2) +
    (locationScore * 0.1)
  );

  const summary = generateRankingSummary(skillsMatch, experienceScore, educationScore, locationScore);

  return {
    candidateId: candidate.id,
    overallScore,
    skillsMatch,
    experienceScore,
    educationScore,
    locationScore,
    summary
  };
}

/**
 * Generate ranking summary
 */
function generateRankingSummary(
  skillsMatch: SkillsMatch,
  experienceScore: number,
  educationScore: number,
  locationScore: number
): string {
  const parts = [];

  if (skillsMatch.matchPercentage >= 80) {
    parts.push(`Strong skills match (${Math.round(skillsMatch.matchPercentage)}%)`);
  } else if (skillsMatch.matchPercentage >= 60) {
    parts.push(`Good skills match (${Math.round(skillsMatch.matchPercentage)}%)`);
  } else {
    parts.push(`Limited skills match (${Math.round(skillsMatch.matchPercentage)}%)`);
  }

  if (experienceScore >= 80) {
    parts.push('Excellent experience level');
  } else if (experienceScore >= 60) {
    parts.push('Good experience level');
  } else {
    parts.push('Limited experience');
  }

  if (educationScore >= 80) {
    parts.push('Strong educational background');
  }

  if (locationScore >= 80) {
    parts.push('Location compatible');
  }

  return parts.join(', ');
}

/**
 * Sort candidates by ranking
 */
export function sortCandidatesByRanking(
  candidates: ParsedCandidate[],
  job: {
    requiredSkills?: string;
    qualifications?: string;
    location?: string;
    title?: string;
  }
): CandidateRanking[] {
  return candidates
    .map(candidate => calculateCandidateRanking(candidate, job))
    .sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Filter candidates by minimum score
 */
export function filterCandidatesByScore(
  rankings: CandidateRanking[],
  minScore: number = 60
): CandidateRanking[] {
  return rankings.filter(ranking => ranking.overallScore >= minScore);
}

/**
 * Get top candidates
 */
export function getTopCandidates(
  rankings: CandidateRanking[],
  limit: number = 10
): CandidateRanking[] {
  return rankings.slice(0, limit);
}
