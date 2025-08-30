'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Linkedin,
  Upload,
  Save,
  X,
  Bot,
  Plus,
  Building,
  MapPin,
  Clock
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
}

export default function AddCandidatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    jobId: '',
    resumeUrl: '',
    linkedinUrl: '',
    notes: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      } else {
        // Fallback to mock data
        setJobs([
          { id: '1', title: 'Senior Frontend Developer', department: 'Engineering', location: 'San Francisco, CA' },
          { id: '2', title: 'Product Manager', department: 'Product', location: 'New York, NY' },
          { id: '3', title: 'UX Designer', department: 'Design', location: 'Remote' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Use mock data
      setJobs([
        { id: '1', title: 'Senior Frontend Developer', department: 'Engineering', location: 'San Francisco, CA' },
        { id: '2', title: 'Product Manager', department: 'Product', location: 'New York, NY' },
        { id: '3', title: 'UX Designer', department: 'Design', location: 'Remote' }
      ]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setAnalyzing(true);

    // TODO: Implement actual file upload and AI analysis
    // For now, simulate the process
    setTimeout(() => {
      setResumeAnalysis(`
        **AI Analysis of Resume:**
        
        **Skills Identified:** React, TypeScript, JavaScript, Node.js, Python, AWS, Docker
        
        **Experience Level:** 5+ years in software development
        
        **Education:** Bachelor's in Computer Science
        
        **Key Highlights:**
        - Led team of 4 developers at previous company
        - Built scalable web applications serving 100k+ users
        - Strong background in full-stack development
        
        **Recommended for:** Senior Frontend Developer, Full Stack Developer positions
      `);
      
      // Auto-populate candidate info based on resume analysis
      setCandidate(prev => ({
        ...prev,
        name: file.name.includes('john') ? 'John Doe' : 'Candidate Name',
        // In real implementation, this would come from AI parsing
      }));
      
      setAnalyzing(false);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...candidate,
          status: 'pending'
        }),
      });

      if (response.ok) {
        router.push('/candidates');
      } else {
        console.error('Failed to create candidate');
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedJob = jobs.find(job => job.id === candidate.jobId);

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
          <h1 className="text-3xl font-bold text-gray-900">Add New Candidate</h1>
          <p className="text-gray-600 mt-2">Add a candidate manually or upload their resume for AI analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Upload & AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Resume Analysis
              </CardTitle>
              <CardDescription>
                Upload a resume for automatic candidate information extraction and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Upload Resume (PDF, DOC, DOCX)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {analyzing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Bot className="w-4 h-4 animate-spin" />
                    Analyzing resume with AI...
                  </div>
                </div>
              )}

              {resumeAnalysis && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">AI Analysis Complete</h4>
                  <div className="text-sm text-green-800 whitespace-pre-line">
                    {resumeAnalysis}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Candidate Information
              </CardTitle>
              <CardDescription>
                Enter candidate details manually or let AI fill them from resume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={candidate.name}
                  onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={candidate.email}
                  onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={candidate.phone}
                  onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={candidate.linkedinUrl}
                  onChange={(e) => setCandidate({ ...candidate, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Job Assignment</CardTitle>
            <CardDescription>
              Select which job position this candidate is applying for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job">Job Position *</Label>
              <Select value={candidate.jobId} onValueChange={(value) => setCandidate({ ...candidate, jobId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job position" />
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

            {selectedJob && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedJob.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  {selectedJob.department && (
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {selectedJob.department}
                    </span>
                  )}
                  {selectedJob.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedJob.location}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Any additional information about the candidate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={candidate.notes}
              onChange={(e) => setCandidate({ ...candidate, notes: e.target.value })}
              placeholder="Add any notes about the candidate..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading || !candidate.name || !candidate.email || !candidate.jobId}>
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Adding Candidate...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Add Candidate
              </>
            )}
          </Button>
          
          <Link href="/candidates">
            <Button type="button" variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
