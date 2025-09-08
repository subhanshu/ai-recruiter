'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Calendar,
  Mail,
  Phone,
  FileText,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Upload,
  Video,
  BarChart3,
  Kanban,
  TrendingUp,
  Star,
  Trash2
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  job?: {
    id: string;
    title: string;
  };
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [generatingLinks, setGeneratingLinks] = useState<Set<string>>(new Set());
  const [deletingCandidate, setDeletingCandidate] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, statusFilter, jobFilter, sortBy]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const candidatesData = await response.json();
        setCandidates(candidatesData);
      } else {
        // Fallback to mock data if API fails
        const mockCandidates = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            status: 'pending',
            createdAt: new Date().toISOString(),
            job: { id: '1', title: 'Senior Frontend Developer' }
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 234-5678',
            status: 'interviewed',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            job: { id: '2', title: 'Product Manager' }
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            phone: '+1 (555) 345-6789',
            status: 'completed',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            job: { id: '3', title: 'UX Designer' }
          },
          {
            id: '4',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            phone: '+1 (555) 456-7890',
            status: 'rejected',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            job: { id: '1', title: 'Senior Frontend Developer' }
          },
          {
            id: '5',
            name: 'David Brown',
            email: 'david.brown@example.com',
            phone: '+1 (555) 567-8901',
            status: 'pending',
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            job: { id: '4', title: 'Backend Developer' }
          }
        ];
        setCandidates(mockCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Use mock data as fallback
      const mockCandidates = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          status: 'pending',
          createdAt: new Date().toISOString(),
          job: { id: '1', title: 'Senior Frontend Developer' }
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 234-5678',
          status: 'interviewed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          job: { id: '2', title: 'Product Manager' }
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phone: '+1 (555) 345-6789',
          status: 'completed',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          job: { id: '3', title: 'UX Designer' }
        },
        {
          id: '4',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          phone: '+1 (555) 456-7890',
          status: 'rejected',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          job: { id: '1', title: 'Senior Frontend Developer' }
        },
        {
          id: '5',
          name: 'David Brown',
          email: 'david.brown@example.com',
          phone: '+1 (555) 567-8901',
          status: 'pending',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          job: { id: '4', title: 'Backend Developer' }
        }
      ];
      setCandidates(mockCandidates);
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.phone && candidate.phone.includes(searchTerm))
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    if (jobFilter && jobFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.job?.id === jobFilter);
    }

    // Sort candidates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'job':
          return (a.job?.title || '').localeCompare(b.job?.title || '');
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredCandidates(filtered);
  };

  const getUniqueStatuses = () => {
    const statuses = candidates.map(candidate => candidate.status).filter(Boolean);
    return [...new Set(statuses)];
  };

  const getUniqueJobs = () => {
    const jobs = candidates
      .map(candidate => candidate.job)
      .filter(Boolean)
      .filter((job, index, self) => 
        index === self.findIndex(j => j?.id === job?.id)
      );
    return jobs;
  };

  const generateInterviewLink = async (candidateId: string, jobId: string) => {
    try {
      setGeneratingLinks(prev => new Set(prev).add(candidateId));
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          jobId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
      });
      
      if (response.ok) {
        const newLink = await response.json();
        // Copy link to clipboard
        navigator.clipboard.writeText(newLink.interviewUrl);
        // You could add a toast notification here
        alert('Interview link generated and copied to clipboard!');
      } else {
        const errorData = await response.json();
        console.error('Failed to generate interview link:', errorData);
        alert(`Failed to generate interview link: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating interview link:', error);
      alert(`Error generating interview link: ${error}`);
    } finally {
      setGeneratingLinks(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
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
        // Remove the candidate from the local state
        setCandidates(prev => prev.filter(candidate => candidate.id !== candidateId));
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
      case 'interviewed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><UserCheck className="w-3 h-3 mr-1" />Interviewed</Badge>;
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
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-2">Manage all candidate applications and track their progress</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <Link href="/candidates/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Candidate
            </Button>
          </Link>
          <Link href="/candidates/kanban">
            <Button variant="outline" className="flex items-center gap-2">
              <Kanban className="w-4 h-4" />
              Kanban View
            </Button>
          </Link>
          <Link href="/interviews">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Interview Results
            </Button>
          </Link>
          <Link href="/candidates/bulk">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Bulk Upload
            </Button>
          </Link>
          <Link href="/outreach">
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Send Outreach
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {getUniqueStatuses().map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {getUniqueJobs().map((job) => (
                  <SelectItem key={job?.id} value={job?.id || ''}>
                    {job?.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="job">Job Position</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 flex items-center justify-center">
              {filteredCandidates.length} of {candidates.length} candidates
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-500 mb-4">
              {candidates.length === 0 
                ? "No candidates have applied yet. Candidates will appear here once they submit applications."
                : "No candidates match your current filters. Try adjusting your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(candidate.status)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
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
                      {candidate.job && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {candidate.job.title}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {formatDate(candidate.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/candidates/${candidate.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    {candidate.job && (
                      <Button
                        size="sm"
                        onClick={() => generateInterviewLink(candidate.id, candidate.job!.id)}
                        disabled={generatingLinks.has(candidate.id)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {generatingLinks.has(candidate.id) ? 'Generating...' : 'AI Interview'}
                      </Button>
                    )}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
