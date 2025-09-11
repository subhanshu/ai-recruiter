'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Plus,
  Eye,
  FileText,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DashboardHelpWidget } from '@/components/help-widget';

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  createdAt: string;
  candidates?: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  status?: string;
  createdAt: string;
}

interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  activeInterviews: number;
  completedInterviews: number;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalCandidates: 0,
    activeInterviews: 0,
    completedInterviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Try to fetch from API first
      const [jobsResponse, candidatesResponse] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/candidates')
      ]);

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.slice(0, 5));
        setStats(prev => ({ ...prev, totalJobs: jobsData.length }));
      } else {
        // Fallback to mock data if API fails
        const mockJobs = [
          {
            id: '1',
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'San Francisco, CA',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Product Manager',
            department: 'Product',
            location: 'New York, NY',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            title: 'UX Designer',
            department: 'Design',
            location: 'Remote',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        setJobs(mockJobs);
        setStats(prev => ({ ...prev, totalJobs: mockJobs.length }));
      }

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        // Add default status for candidates that don't have one
        const candidatesWithStatus = candidatesData.map((candidate: { status?: string; [key: string]: unknown }) => ({
          ...candidate,
          status: candidate.status || 'pending'
        }));
        setCandidates(candidatesWithStatus.slice(0, 5));
        setStats(prev => ({ ...prev, totalCandidates: candidatesData.length }));
      } else {
        // Fallback to mock data if API fails
        const mockCandidates = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'interviewed',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            status: 'completed',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        setCandidates(mockCandidates);
        setStats(prev => ({ ...prev, totalCandidates: mockCandidates.length }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data as fallback
      const mockJobs = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Product Manager',
          department: 'Product',
          location: 'New York, NY',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          title: 'UX Designer',
          department: 'Design',
          location: 'Remote',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      const mockCandidates = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          status: 'interviewed',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          status: 'completed',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setJobs(mockJobs);
      setCandidates(mockCandidates);
      setStats({
        totalJobs: mockJobs.length,
        totalCandidates: mockCandidates.length,
        activeInterviews: 2,
        completedInterviews: 1
      });
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with your recruitment process.</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Link href="/jobs/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Post New Job
            </Button>
          </Link>
          <Link href="/ai-assistant">
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/jobs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                Active job postings
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/candidates">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCandidates}</div>
              <p className="text-xs text-muted-foreground">
                Applied candidates
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/outreach">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeInterviews}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled interviews
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/candidates">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedInterviews}</div>
              <p className="text-xs text-muted-foreground">
                Finished interviews
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>Your latest job postings and their status</CardDescription>
              </div>
              <Link href="/jobs">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No jobs posted yet</p>
                <Link href="/jobs/new">
                  <Button variant="outline" size="sm" className="mt-2">
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          {job.department && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {job.department}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {job.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Candidates</CardTitle>
                <CardDescription>Latest applications and their status</CardDescription>
              </div>
              <Link href="/candidates">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No candidates yet</p>
                <p className="text-sm">Candidates will appear here once they apply</p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                        <p className="text-sm text-gray-500">{candidate.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(candidate.status)}
                          <span className="text-xs text-gray-400">
                            {formatDate(candidate.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/jobs/new">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Post New Job</h4>
                    <p className="text-sm text-gray-500">Create a new job posting</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/ai-assistant">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">AI Assistant</h4>
                    <p className="text-sm text-gray-500">Get help with recruitment</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/outreach">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Candidate Outreach</h4>
                    <p className="text-sm text-gray-500">Send interview invitations</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help Widget */}
      <DashboardHelpWidget />
    </div>
  );
}
