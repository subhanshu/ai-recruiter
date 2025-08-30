'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Linkedin,
  MapPin,
  Building,
  MessageSquare,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  ExternalLink,
  Briefcase
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  job?: Job;
  interviews?: Interview[];
}

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
}

interface Interview {
  id: string;
  createdAt: string;
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  score?: number;
}

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.id as string;
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCandidateDetails();
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      // For now, we'll fetch from the candidates endpoint and find the specific candidate
      // In a real app, you'd have a specific endpoint for individual candidates
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const candidatesData = await response.json();
        const foundCandidate = candidatesData.find((c: Candidate) => c.id === candidateId);
        if (foundCandidate) {
          setCandidate(foundCandidate);
        }
      } else {
        // Fallback to mock data if API fails
        const mockCandidate: Candidate = {
          id: candidateId,
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          status: 'pending',
          createdAt: new Date().toISOString(),
          resumeUrl: 'https://example.com/resume.pdf',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          job: {
            id: '1',
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'San Francisco, CA'
          },
          interviews: [
            {
              id: '1',
              createdAt: new Date().toISOString(),
              recordingUrl: 'https://example.com/recording.mp4',
              transcript: 'Interview transcript would go here...',
              summary: 'Strong technical skills, good communication, needs improvement in system design',
              score: 0.85
            }
          ]
        };
        setCandidate(mockCandidate);
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      // Use mock data as fallback
      const mockCandidate: Candidate = {
        id: candidateId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        status: 'pending',
        createdAt: new Date().toISOString(),
        resumeUrl: 'https://example.com/resume.pdf',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        job: {
          id: '1',
          title: 'Senior Frontend Developer',
          department: 'Engineering',
          location: 'San Francisco, CA'
        },
        interviews: [
          {
            id: '1',
            createdAt: new Date().toISOString(),
            recordingUrl: 'https://example.com/recording.mp4',
            transcript: 'Interview transcript would go here...',
            summary: 'Strong technical skills, good communication, needs improvement in system design',
            score: 0.85
          }
        ]
      };
      setCandidate(mockCandidate);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'interviewed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><UserCheck className="w-3 h-3 mr-1" />Interviewed</Badge>;
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

  const formatScore = (score?: number) => {
    if (!score) return 'N/A';
    return `${Math.round(score * 100)}%`;
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

  if (!candidate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Candidate not found</h3>
            <p className="text-gray-500 mb-4">The candidate you're looking for doesn't exist or has been removed.</p>
            <Link href="/candidates">
              <Button>Back to Candidates</Button>
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
            <Link href="/candidates">
              <Button variant="ghost" size="sm">
                ← Back to Candidates
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
          <div className="flex items-center gap-4 text-gray-600 mt-2">
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
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link href={`/outreach?candidateId=${candidateId}`}>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Outreach
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({candidate.interviews?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{candidate.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{candidate.email}</p>
                  </div>
                  {candidate.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{candidate.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(candidate.status)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle>Job Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.job ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Position</label>
                      <p className="text-gray-900">{candidate.job.title}</p>
                    </div>
                    {candidate.job.department && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="text-gray-900">{candidate.job.department}</p>
                      </div>
                    )}
                    {candidate.job.location && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Location</label>
                        <p className="text-gray-900">{candidate.job.location}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Application Date</label>
                      <p className="text-gray-900">{formatDate(candidate.createdAt)}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No job information available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Application Tab */}
        <TabsContent value="application" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.resumeUrl ? (
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Resume uploaded</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="w-full">
                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          View Resume
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={candidate.resumeUrl} download>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No resume uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LinkedIn Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5" />
                  LinkedIn Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.linkedinUrl ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">LinkedIn profile available</p>
                    </div>
                    <Button asChild className="w-full">
                      <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        View Profile
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Linkedin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No LinkedIn profile</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Interview History</CardTitle>
                  <CardDescription>All interviews conducted with this candidate</CardDescription>
                </div>
                <Link href={`/outreach?candidateId=${candidateId}`}>
                  <Button size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!candidate.interviews || candidate.interviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No interviews conducted yet</p>
                  <p className="text-sm">Schedule an interview to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidate.interviews.map((interview) => (
                    <div key={interview.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Interview on {formatDate(interview.createdAt)}
                          </h4>
                          {interview.score && (
                            <p className="text-sm text-gray-500">
                              Score: {formatScore(interview.score)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {interview.recordingUrl && (
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Recording
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {interview.summary && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Summary</h5>
                          <p className="text-sm text-gray-600">{interview.summary}</p>
                        </div>
                      )}
                      
                      {interview.transcript && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Transcript</h5>
                          <p className="text-sm text-gray-600 line-clamp-3">{interview.transcript}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
