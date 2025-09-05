'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus,
  User, 
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Eye,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient } from '@/lib/supabase-client';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
  jobId: string;
  job: {
    title: string;
    department: string;
  };
  interviewStatus: 'not_scheduled' | 'scheduled' | 'in_progress' | 'completed' | 'rejected';
  interviewScore?: number;
  interviewDate?: string;
  lastInterview?: {
    id: string;
    score: number;
    summary: string;
    createdAt: string;
  };
}

const statusConfig = {
  not_scheduled: {
    title: 'Not Scheduled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Clock,
    description: 'No interview scheduled yet'
  },
  scheduled: {
    title: 'Scheduled',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Calendar,
    description: 'Interview scheduled'
  },
  in_progress: {
    title: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: MessageSquare,
    description: 'Interview in progress'
  },
  completed: {
    title: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Interview completed'
  },
  rejected: {
    title: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Not selected'
  }
};

export default function KanbanBoardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobs, setJobs] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, selectedJob]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('Candidate')
        .select(`
          *,
          job:Job(title, department),
          interviews:Interview(
            id,
            score,
            summary,
            createdAt,
            evaluation:InterviewEvaluation(overallScore, recommendation)
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      // Process candidates and determine their interview status
      const processedCandidates = (data || []).map(candidate => {
        const interviews = candidate.interviews || [];
        const lastInterview = interviews[0]; // Most recent interview
        
        let interviewStatus: Candidate['interviewStatus'] = 'not_scheduled';
        let interviewScore: number | undefined;
        let interviewDate: string | undefined;

        if (interviews.length > 0) {
          interviewDate = lastInterview.createdAt;
          interviewScore = lastInterview.evaluation?.overallScore || lastInterview.score;
          
          if (lastInterview.evaluation?.recommendation === 'hire') {
            interviewStatus = 'completed';
          } else if (lastInterview.evaluation?.recommendation === 'no hire') {
            interviewStatus = 'rejected';
          } else if (lastInterview.summary) {
            interviewStatus = 'completed';
          } else {
            interviewStatus = 'in_progress';
          }
        }

        return {
          ...candidate,
          interviewStatus,
          interviewScore,
          interviewDate,
          lastInterview: lastInterview ? {
            id: lastInterview.id,
            score: lastInterview.evaluation?.overallScore || lastInterview.score || 0,
            summary: lastInterview.summary || '',
            createdAt: lastInterview.createdAt
          } : undefined
        };
      });

      setCandidates(processedCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('Job')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const filterCandidates = () => {
    let filtered = [...candidates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.job?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Job filter
    if (selectedJob !== 'all') {
      filtered = filtered.filter(candidate => candidate.jobId === selectedJob);
    }

    setFilteredCandidates(filtered);
  };

  const getCandidatesByStatus = (status: Candidate['interviewStatus']) => {
    return filteredCandidates.filter(candidate => candidate.interviewStatus === status);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="w-3 h-3" />;
    if (score >= 0.6) return <AlertCircle className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Candidate Pipeline</h1>
          <p className="text-muted-foreground">
            Manage candidate interview status and progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusCandidates = getCandidatesByStatus(status as Candidate['interviewStatus']);
          const Icon = config.icon;

          return (
            <div key={status} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-semibold">{config.title}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {statusCandidates.length}
                  </Badge>
                </div>
              </div>

              {/* Column Description */}
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>

              {/* Cards */}
              <div className="space-y-3 min-h-[400px]">
                <AnimatePresence>
                  {statusCandidates.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          {/* Candidate Info */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {candidate.name}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {candidate.email}
                                </p>
                              </div>
                            </div>

                            {/* Job Info */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Building className="w-3 h-3" />
                              <span className="truncate">{candidate.job?.title}</span>
                            </div>

                            {/* Score (if available) */}
                            {candidate.interviewScore !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(candidate.interviewScore)}`}>
                                  {getScoreIcon(candidate.interviewScore)}
                                  {Math.round(candidate.interviewScore * 100)}%
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Interview Score
                                </span>
                              </div>
                            )}

                            {/* Interview Date */}
                            {candidate.interviewDate && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(candidate.interviewDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {/* Last Interview Summary */}
                            {candidate.lastInterview?.summary && (
                              <div className="text-xs text-muted-foreground">
                                <p className="line-clamp-2">
                                  {candidate.lastInterview.summary}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-1 pt-2">
                              <Button size="sm" variant="ghost" className="h-7 px-2">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2">
                                <MessageSquare className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2">
                                <Star className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {statusCandidates.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No candidates</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = getCandidatesByStatus(status as Candidate['interviewStatus']).length;
          const total = filteredCandidates.length;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const Icon = config.icon;

          return (
            <Card key={status}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{config.title}</div>
                <div className="text-xs text-muted-foreground">{percentage}%</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
