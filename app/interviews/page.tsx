'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Download, 
  Clock, 
  User, 
  Building,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabaseClient } from '@/lib/supabase-client';

interface InterviewResult {
  id: string;
  candidateId: string;
  jobId: string;
  transcript: string;
  summary: string;
  score: number;
  createdAt: string;
  candidate: {
    name: string;
    email: string;
  };
  job: {
    title: string;
    department: string;
  };
  evaluation?: {
    overallScore: number;
    overallEvaluation: string;
    strengths: string[];
    improvements: string[];
    recommendation: string;
  };
}

function InterviewResultsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [interviews, setInterviews] = useState<InterviewResult[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState<InterviewResult | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabaseClient
        .from('Interview')
        .select(`
          *,
          candidate:Candidate(name, email),
          job:Job(title, department),
          evaluation:InterviewEvaluation(*)
        `)
        .order('createdAt', { ascending: false });

      // Filter by jobId if provided
      if (jobId) {
        query = query.eq('jobId', jobId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const filterAndSortInterviews = useCallback(() => {
    let filtered = [...interviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(interview => 
        interview.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(interview => {
        const score = interview.evaluation?.overallScore || interview.score || 0;
        switch (filterBy) {
          case 'excellent': return score >= 80;
          case 'good': return score >= 60 && score < 80;
          case 'fair': return score >= 40 && score < 60;
          case 'poor': return score < 40;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          const scoreA = a.evaluation?.overallScore || a.score || 0;
          const scoreB = b.evaluation?.overallScore || b.score || 0;
          return scoreB - scoreA;
        case 'name':
          return (a.candidate?.name || '').localeCompare(b.candidate?.name || '');
        case 'job':
          return (a.job?.title || '').localeCompare(b.job?.title || '');
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredInterviews(filtered);
  }, [interviews, searchTerm, sortBy, filterBy]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  useEffect(() => {
    filterAndSortInterviews();
  }, [interviews, searchTerm, sortBy, filterBy, filterAndSortInterviews]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'hire': return 'bg-green-100 text-green-800 border-green-200';
      case 'maybe': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no hire': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <h1 className="text-3xl font-bold">Interview Results</h1>
          {jobId && interviews.length > 0 && interviews[0].job ? (
            <div className="mt-2">
              <p className="text-muted-foreground">
                Interview results for: <span className="font-medium text-foreground">{interviews[0].job.title}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {interviews[0].job.department && `${interviews[0].job.department} • `}
                {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} completed
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Review and analyze candidate interview performance
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {jobId && (
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              ← Back to Job
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search candidates, jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="job">Job</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="excellent">Excellent (80+)</SelectItem>
                <SelectItem value="good">Good (60-79)</SelectItem>
                <SelectItem value="fair">Fair (40-59)</SelectItem>
                <SelectItem value="poor">Poor (&lt;40)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid gap-6">
        {filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No interviews found</p>
                <p>Try adjusting your search or filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInterviews.map((interview) => {
            const overallScore = interview.evaluation?.overallScore || interview.score || 0;
            const recommendation = interview.evaluation?.recommendation || 'pending';
            
            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedInterview(interview)}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Candidate Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {interview.candidate?.name || 'Unknown Candidate'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {interview.candidate?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="w-4 h-4" />
                          <span>{interview.job?.title}</span>
                          <span>•</span>
                          <span>{interview.job?.department}</span>
                        </div>
                      </div>

                      {/* Score and Status */}
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="text-center">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(overallScore * 100)}`}>
                            {getScoreIcon(overallScore * 100)}
                            {Math.round(overallScore * 100)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
                        </div>
                        
                        <Badge className={getRecommendationColor(recommendation)}>
                          {recommendation.toUpperCase()}
                        </Badge>
                        
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Interview Performance</span>
                        <span>{Math.round(overallScore * 100)}%</span>
                      </div>
                      <Progress value={overallScore * 100} className="h-2" />
                    </div>

                    {/* Quick Summary */}
                    {interview.summary && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm line-clamp-2">
                          {interview.summary}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Interview Details</CardTitle>
                  <CardDescription>
                    {selectedInterview.candidate?.name} - {selectedInterview.job?.title}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedInterview(null)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score and Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((selectedInterview.evaluation?.overallScore || selectedInterview.score || 0) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Badge className={getRecommendationColor(selectedInterview.evaluation?.recommendation || 'pending')}>
                      {selectedInterview.evaluation?.recommendation?.toUpperCase() || 'PENDING'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">Recommendation</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {new Date(selectedInterview.createdAt).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Interview Date</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Evaluation */}
              {selectedInterview.evaluation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detailed Analysis</h3>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Overall Evaluation</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedInterview.evaluation.overallEvaluation}
                      </p>
                    </CardContent>
                  </Card>

                  {selectedInterview.evaluation.strengths && selectedInterview.evaluation.strengths.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {selectedInterview.evaluation.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {selectedInterview.evaluation.improvements && selectedInterview.evaluation.improvements.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-orange-600" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {selectedInterview.evaluation.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Transcript */}
              {selectedInterview.transcript && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Interview Transcript</h4>
                    <div className="bg-muted/50 p-3 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {selectedInterview.transcript}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function InterviewResultsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    }>
      <InterviewResultsContent />
    </Suspense>
  );
}
