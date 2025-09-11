'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Briefcase, 
  Star,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { parseCandidateData, calculateSkillsMatch } from '@/lib/candidate-utils';
import { Candidate, ParsedCandidate, SkillsMatch } from '@/types';

interface EnhancedInterviewPrepProps {
  candidate: Candidate;
  job: {
    title: string;
    requiredSkills?: string;
    qualifications?: string;
    location?: string;
  };
}

interface PersonalizedQuestion {
  id: string;
  text: string;
  category: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export function EnhancedInterviewPrep({ candidate, job }: EnhancedInterviewPrepProps) {
  const [parsedCandidate, setParsedCandidate] = useState<ParsedCandidate | null>(null);
  const [personalizedQuestions, setPersonalizedQuestions] = useState<PersonalizedQuestion[]>([]);
  const [skillsMatch, setSkillsMatch] = useState<SkillsMatch | null>(null);
  const [loading, setLoading] = useState(true);

  const generatePersonalizedQuestions = useCallback((candidate: ParsedCandidate, job: { title: string; requiredSkills?: string; qualifications?: string; location?: string }) => {
    const questions: PersonalizedQuestion[] = [];

    // Skills-based questions
    if (candidate.skills && candidate.skills.length > 0) {
      const topSkills = candidate.skills.slice(0, 3);
      topSkills.forEach(skill => {
        questions.push({
          id: `skill-${skill}`,
          text: `Tell me about your experience with ${skill}. Can you walk me through a specific project where you used this technology?`,
          category: 'Technical Skills',
          reasoning: `Based on your ${skill} experience`,
          priority: 'high'
        });
      });
    }

    // Experience-based questions
    if (candidate.experience) {
      questions.push({
        id: 'experience-level',
        text: `You have ${candidate.experience} of experience. How has your approach to problem-solving evolved over your career?`,
        category: 'Experience',
        reasoning: `Based on your ${candidate.experience} experience`,
        priority: 'high'
      });
    }

    // Work history questions
    if (candidate.workHistory && candidate.workHistory.length > 0) {
      const recentWork = candidate.workHistory[0];
      questions.push({
        id: 'recent-work',
        text: `In your recent role as ${recentWork.position} at ${recentWork.company}, what was your biggest achievement?`,
        category: 'Work History',
        reasoning: `Based on your recent role at ${recentWork.company}`,
        priority: 'high'
      });
    }

    // Project-based questions
    if (candidate.projects && candidate.projects.length > 0) {
      const topProject = candidate.projects[0];
      questions.push({
        id: 'project-detail',
        text: `I see you worked on ${topProject.name}. Can you explain the technical challenges you faced and how you overcame them?`,
        category: 'Projects',
        reasoning: `Based on your ${topProject.name} project`,
        priority: 'medium'
      });
    }

    // Education questions
    if (candidate.education) {
      questions.push({
        id: 'education',
        text: `How has your ${candidate.education} background prepared you for this role?`,
        category: 'Education',
        reasoning: `Based on your educational background`,
        priority: 'medium'
      });
    }

    // Location questions
    if (candidate.location && job.location) {
      questions.push({
        id: 'location',
        text: `I see you're based in ${candidate.location}. How do you feel about working ${job.location === 'Remote' ? 'remotely' : `in ${job.location}`}?`,
        category: 'Location',
        reasoning: `Based on your location preferences`,
        priority: 'low'
      });
    }

    // Skills gap questions
    if (skillsMatch && skillsMatch.missingSkills.length > 0) {
      const topMissingSkill = skillsMatch.missingSkills[0];
      questions.push({
        id: 'skills-gap',
        text: `I notice you don't have direct experience with ${topMissingSkill}. How would you approach learning this technology?`,
        category: 'Skills Gap',
        reasoning: `Addressing potential skills gap`,
        priority: 'medium'
      });
    }

    setPersonalizedQuestions(questions);
  }, [skillsMatch]);

  useEffect(() => {
    const parsed = parseCandidateData(candidate);
    setParsedCandidate(parsed);

    // Calculate skills match
    const match = calculateSkillsMatch(
      parsed.skills,
      job.requiredSkills?.split(',').map(s => s.trim()) || []
    );
    setSkillsMatch(match);

    // Generate personalized questions
    generatePersonalizedQuestions(parsed, job);
    setLoading(false);
  }, [candidate, job, generatePersonalizedQuestions]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Preparing personalized interview questions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skills Match Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Skills Match Analysis
          </CardTitle>
          <CardDescription>
            How well the candidate&apos;s skills align with job requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Match</span>
              <span className="text-sm text-gray-600">
                {Math.round(skillsMatch?.matchPercentage || 0)}%
              </span>
            </div>
            <Progress value={skillsMatch?.matchPercentage || 0} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2">Matched Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {skillsMatch?.matchedSkills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {skillsMatch?.missingSkills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Personalized Interview Questions
          </CardTitle>
          <CardDescription>
            AI-generated questions based on the candidate&apos;s background and experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalizedQuestions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(question.priority)}>
                      {question.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{question.category}</Badge>
                  </div>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
                
                <p className="text-gray-900 mb-2">{question.text}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lightbulb className="w-4 h-4" />
                  <span className="italic">{question.reasoning}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Interview Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Focus on Experience</p>
                <p className="text-sm text-gray-600">
                  The candidate has {parsedCandidate?.experience || 'relevant'} experience. 
                  Ask about specific projects and achievements.
                </p>
              </div>
            </div>
            
            {skillsMatch?.missingSkills && skillsMatch.missingSkills.length > 0 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">Address Skills Gaps</p>
                  <p className="text-sm text-gray-600">
                    Ask about their learning approach for missing skills: {skillsMatch?.missingSkills?.slice(0, 3).join(', ')}
                  </p>
                </div>
              </div>
            )}
            
            {parsedCandidate?.workHistory && parsedCandidate.workHistory.length > 0 && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Leverage Work History</p>
                  <p className="text-sm text-gray-600">
                    Reference their experience at {parsedCandidate.workHistory[0].company} 
                    to ask follow-up questions about relevant challenges.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
