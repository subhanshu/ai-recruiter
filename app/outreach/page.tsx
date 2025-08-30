'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Clock, 
  Send,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  job?: Job;
}

export default function OutreachPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentLinks, setSentLinks] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const candidateIdFromUrl = searchParams.get('candidateId');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (candidateIdFromUrl) {
      setSelectedCandidates([candidateIdFromUrl]);
    }
  }, [candidateIdFromUrl]);

  const fetchData = async () => {
    try {
      const [jobsResponse, candidatesResponse] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/candidates')
      ]);

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
        if (jobsData.length > 0) {
          setSelectedJob(jobsData[0].id);
        }
      }

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        setCandidates(candidatesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSendOutreach = async () => {
    if (selectedCandidates.length === 0 || !selectedJob) {
      return;
    }

    setSending(true);
    const newLinks = [];

    try {
      for (const candidateId of selectedCandidates) {
        const response = await fetch('/api/outreach', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateId,
            jobId: selectedJob,
            expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
          }),
        });

        if (response.ok) {
          const linkData = await response.json();
          newLinks.push(linkData);
        }
      }

      setSentLinks(prev => [...prev, ...newLinks]);
      setShowSuccess(true);
      setSelectedCandidates([]);
      
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending outreach:', error);
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getDefaultMessage = () => {
    const job = jobs.find(j => j.id === selectedJob);
    if (!job) return '';

    return `Hi there!

We're excited to invite you to interview for the ${job.title} position${job.department ? ` in our ${job.department} department` : ''}${job.location ? ` located in ${job.location}` : ''}.

Please click the link below to start your interview when you're ready. The interview will take approximately 15-20 minutes and can be completed at your convenience.

Best regards,
The Recruitment Team`;
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Candidate Outreach</h1>
        <p className="text-gray-600 mt-2">Send interview invitations to candidates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Outreach Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Send Interview Invitations
            </CardTitle>
            <CardDescription>
              Select candidates and send them personalized interview invitations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Selection */}
            <div className="space-y-2">
              <Label htmlFor="job">Select Job Position</Label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job position" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                      {job.department && ` - ${job.department}`}
                      {job.location && ` (${job.location})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Candidate Selection */}
            <div className="space-y-2">
              <Label>Select Candidates</Label>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
                {candidates
                  .filter(candidate => !selectedJob || candidate.job?.id === selectedJob)
                  .map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                        selectedCandidates.includes(candidate.id)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCandidateToggle(candidate.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => {}}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-sm text-gray-500">
                {selectedCandidates.length} candidate(s) selected
              </p>
            </div>

            {/* Expiry Settings */}
            <div className="space-y-2">
              <Label htmlFor="expiry">Link Expiry (days)</Label>
              <Select value={expiryDays.toString()} onValueChange={(value) => setExpiryDays(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder={getDefaultMessage()}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
              />
              <p className="text-sm text-gray-500">
                Leave empty to use the default message
              </p>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendOutreach}
              disabled={selectedCandidates.length === 0 || !selectedJob || sending}
              className="w-full"
            >
              {sending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Interview Invitations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sent Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recent Invitations
            </CardTitle>
            <CardDescription>
              Track your recently sent interview invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                Interview invitations sent successfully!
              </div>
            )}

            {sentLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No invitations sent yet</p>
                <p className="text-sm">Send your first invitation to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentLinks.slice(-5).reverse().map((link, index) => {
                  const candidate = candidates.find(c => c.id === link.candidateId);
                  const job = jobs.find(j => j.id === link.jobId);
                  
                  return (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">{candidate?.name}</div>
                          <div className="text-sm text-gray-500">{job?.title}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          value={link.interviewUrl}
                          readOnly
                          className="text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(link.interviewUrl)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
