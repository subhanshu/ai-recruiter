'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, 
  MapPin, 
  Building, 
  Calendar, 
  Users, 
  FileText,
  Edit,
  Trash2,
  Plus,
  MessageSquare,
  Eye,
  Phone,
  Mail,
  Clock,
  Bot,
  CheckCircle,
  XCircle,
  Save,
  X,
  BarChart3
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  responsibilities?: string;
  requiredSkills?: string;
  qualifications?: string;
  jdRaw: string;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
  candidates?: Candidate[];
}

interface Question {
  id: string;
  text: string;
  order: number;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  resumeUrl?: string;
  linkedinUrl?: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [deletingCandidate, setDeletingCandidate] = useState<string | null>(null);
  
  // Question management state
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [deletingQuestion, setDeletingQuestion] = useState<string | null>(null);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    // Handle tab parameter from URL
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'candidates', 'questions', 'interviews'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchJobDetails = async () => {
    try {
      const [jobResponse, candidatesResponse] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch(`/api/candidates?jobId=${jobId}`)
      ]);

      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJob(jobData);
      } else {
        // Fallback to mock data if API fails
        const mockJob: Job = {
          id: jobId,
          title: 'Senior Frontend Developer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          responsibilities: 'Develop and maintain web applications using React, TypeScript, and modern web technologies. Collaborate with design and backend teams to create seamless user experiences.',
          requiredSkills: 'React, TypeScript, JavaScript, HTML/CSS, Git, REST APIs',
          qualifications: 'Bachelor\'s degree in Computer Science or related field, 3+ years of experience',
          jdRaw: 'We are looking for a Senior Frontend Developer to join our team...',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          questions: [
            { id: '1', text: 'Tell us about your experience with React and TypeScript', order: 1 },
            { id: '2', text: 'How do you approach responsive design?', order: 2 },
            { id: '3', text: 'Describe a challenging project you worked on', order: 3 }
          ],
          candidates: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '+1 (555) 123-4567',
              status: 'pending',
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              phone: '+1 (555) 234-5678',
              status: 'interviewed',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        };
        setJob(mockJob);
      }

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        if (job) {
          setJob(prev => prev ? { ...prev, candidates: candidatesData } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      // Use mock data as fallback
      const mockJob: Job = {
        id: jobId,
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        responsibilities: 'Develop and maintain web applications using React, TypeScript, and modern web technologies. Collaborate with design and backend teams to create seamless user experiences.',
        requiredSkills: 'React, TypeScript, JavaScript, HTML/CSS, Git, REST APIs',
        qualifications: 'Bachelor\'s degree in Computer Science or related field, 3+ years of experience',
        jdRaw: 'We are looking for a Senior Frontend Developer to join our team...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questions: [
          { id: '1', text: 'Tell us about your experience with React and TypeScript', order: 1 },
          { id: '2', text: 'How do you approach responsive design?', order: 2 },
          { id: '3', text: 'Describe a challenging project you worked on', order: 3 }
        ],
        candidates: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 234-5678',
            status: 'interviewed',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      };
      setJob(mockJob);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) {
      return <Badge variant="outline">Unknown</Badge>;
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const deleteCandidate = async (candidateId: string) => {
    if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }

    setDeletingCandidate(candidateId);
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the job details to update the candidates list
        await fetchJobDetails();
        alert('Candidate deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to delete candidate:', errorData);
        alert(`Failed to delete candidate: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert(`Error deleting candidate: ${error}`);
    } finally {
      setDeletingCandidate(null);
    }
  };

  // Question management functions
  const addQuestion = async () => {
    if (!newQuestionText.trim()) return;

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          text: newQuestionText.trim(),
        }),
      });

      if (response.ok) {
        await fetchJobDetails();
        setNewQuestionText('');
        setAddingQuestion(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to add question: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert(`Error adding question: ${error}`);
    }
  };

  const startEditingQuestion = (questionId: string, currentText: string) => {
    setEditingQuestion(questionId);
    setEditingText(currentText);
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setEditingText('');
  };

  const saveQuestion = async (questionId: string) => {
    if (!editingText.trim()) return;

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editingText.trim(),
        }),
      });

      if (response.ok) {
        await fetchJobDetails();
        setEditingQuestion(null);
        setEditingText('');
      } else {
        const errorData = await response.json();
        alert(`Failed to update question: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert(`Error updating question: ${error}`);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setDeletingQuestion(questionId);
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchJobDetails();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete question: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert(`Error deleting question: ${error}`);
    } finally {
      setDeletingQuestion(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
            <p className="text-gray-500 mb-4">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/jobs">
              <Button>Back to Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/jobs">
              <Button variant="ghost" size="sm">
                ← Back to Jobs
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex items-center gap-4 text-gray-600 mt-2">
            {job.department && (
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Posted {formatDate(job.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link href={`/candidates/new?jobId=${jobId}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </Link>
          <Link href={`/interviews?jobId=${jobId}`}>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Interview Results
            </Button>
          </Link>
          <Link href={`/jobs/${jobId}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </Button>
          </Link>
          <Link href={`/outreach?jobId=${jobId}`}>
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Outreach
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates ({job.candidates?.length || 0})</TabsTrigger>
          <TabsTrigger value="questions">Questions ({job.questions?.length || 0})</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Responsibilities</h4>
                  <p className="text-gray-600">
                    {job.responsibilities || job.jdRaw || 'No responsibilities specified'}
                  </p>
                </div>
                
                {job.requiredSkills && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                    <p className="text-gray-600">{job.requiredSkills}</p>
                  </div>
                )}
                
                {job.qualifications && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                    <p className="text-gray-600">{job.qualifications}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{job.candidates?.length || 0}</div>
                    <div className="text-sm text-blue-600">Total Candidates</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{job.questions?.length || 0}</div>
                    <div className="text-sm text-green-600">Interview Questions</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Last updated: {formatDate(job.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Candidates</CardTitle>
                  <CardDescription>All candidates who have applied for this position</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={`/candidates/new?jobId=${jobId}`}>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Candidate
                    </Button>
                  </Link>
                  <Link href={`/outreach?jobId=${jobId}`}>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Outreach
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!job.candidates || job.candidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No candidates have applied yet</p>
                  <p className="text-sm">Candidates will appear here once they submit applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {job.candidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {candidate.email}
                          </span>
                          {candidate.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {candidate.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {formatDate(candidate.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(candidate.status)}
                        <Link href={`/candidates/${candidate.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/outreach?candidateId=${candidate.id}`}>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Outreach
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteCandidate(candidate.id)}
                          disabled={deletingCandidate === candidate.id}
                        >
                          {deletingCandidate === candidate.id ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Interview Questions</CardTitle>
                  <CardDescription>Questions that candidates will answer during their interview</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={generatingQuestions}
                    onClick={async () => {
                      setGeneratingQuestions(true);
                      try {
                        const response = await fetch('/api/ai/generate-questions', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            jobDescription: job.jdRaw || job.responsibilities || '',
                            jobTitle: job.title
                          })
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          if (data.questions && Array.isArray(data.questions)) {
                            setGeneratedQuestions(data.questions);
                            // Switch to questions tab to show the generated questions
                            setActiveTab('questions');
                          }
                        } else {
                          alert('Failed to generate questions. Please try again.');
                        }
                      } catch (error) {
                        console.error('Error generating questions:', error);
                        alert('Error generating questions. Please try again.');
                      } finally {
                        setGeneratingQuestions(false);
                      }
                    }}
                  >
                    {generatingQuestions ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 mr-2" />
                        AI: Generate Questions
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      console.log('Header add question button clicked');
                      setAddingQuestion(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Show generated questions if they exist */}
              {generatedQuestions.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Generated Questions</h4>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={async () => {
                          // Save generated questions to the job
                          try {
                            const response = await fetch(`/api/jobs/${jobId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title: job.title,
                                jdRaw: job.jdRaw,
                                questions: generatedQuestions
                              })
                            });
                            
                            if (response.ok) {
                              // Refresh job data
                              await fetchJobDetails();
                              setGeneratedQuestions([]);
                              alert('Questions saved successfully!');
                            } else {
                              const errorData = await response.json();
                              console.error('Save error:', errorData);
                              alert('Failed to save questions. Please try again.');
                            }
                          } catch (error) {
                            console.error('Error saving questions:', error);
                            alert('Error saving questions. Please try again.');
                          }
                        }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Questions
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setGeneratedQuestions([])}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Discard
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {generatedQuestions.map((question, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-blue-50">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">{question}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new question form */}
              {addingQuestion && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Add New Question</h4>
                  <div className="space-y-3">
                    <Textarea
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Enter your question here..."
                      className="resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={addQuestion} disabled={!newQuestionText.trim()}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Question
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setAddingQuestion(false);
                        setNewQuestionText('');
                      }}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add question button - always show when not adding */}
              {!addingQuestion && (
                <div className="mb-6">
                  <Button 
                    onClick={() => {
                      console.log('Add question button clicked');
                      setAddingQuestion(true);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Question
                  </Button>
                </div>
              )}

              {/* Show existing questions */}
              {(!job.questions || job.questions.length === 0) && generatedQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No questions set for this job</p>
                  <p className="text-sm">Add questions to create a structured interview process</p>
                </div>
              ) : job.questions && job.questions.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Current Questions</h4>
                  {job.questions
                    .sort((a, b) => a.order - b.order)
                    .map((question, index) => (
                      <div key={question.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          {editingQuestion === question.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="resize-none"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => saveQuestion(question.id)}
                                  disabled={!editingText.trim()}
                                >
                                  <Save className="w-4 h-4 mr-1" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-900">{question.text}</p>
                          )}
                        </div>
                        {editingQuestion !== question.id && (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => startEditingQuestion(question.id, question.text)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => deleteQuestion(question.id)}
                              disabled={deletingQuestion === question.id}
                            >
                              {deletingQuestion === question.id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Interview Results</CardTitle>
                  <CardDescription>View interview results and analysis for candidates of this job</CardDescription>
                </div>
                <Link href={`/interviews?jobId=${jobId}`}>
                  <Button>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View All Results
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Interview Results</p>
                <p className="text-sm mb-4">View detailed interview analysis and candidate scores</p>
                <Link href={`/interviews?jobId=${jobId}`}>
                  <Button>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Interview Results
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
