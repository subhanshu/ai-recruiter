'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  FileText, 
  Upload,
  Save,
  X,
  Bot,
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

function AddCandidateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  // Initialize candidate with default values
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    jobId: '',
    resumeUrl: '',
    linkedinUrl: '',
    location: '',
    skills: '',
    experience: '',
    education: '',
    summary: '',
    workHistory: '',
    projects: '',
    certifications: '',
    languages: '',
    notes: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);


  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle job preselection from URL parameters
  useEffect(() => {
    if (jobs.length > 0) {
      const jobIdFromUrl = searchParams.get('jobId');
      
      if (jobIdFromUrl && candidate.jobId !== jobIdFromUrl) {
        const jobExists = jobs.find(job => job.id === jobIdFromUrl);
        
        if (jobExists) {
          setCandidate(prev => ({ ...prev, jobId: jobIdFromUrl }));
          console.log('✅ Job preselected:', jobExists.title);
        }
      }
    }
  }, [jobs, searchParams, candidate.jobId]);

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

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain' // Allow plain text for testing
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, Word document, or plain text file (.pdf, .doc, .docx, .txt)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Please upload a file smaller than 10MB.');
      return;
    }

    setResumeFile(file);
    setAnalyzing(true);
    setResumeAnalysis('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch('/api/ai/parse-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setResumeAnalysis(`
          **AI Analysis Complete!**
          
          **Extracted Information:**
          - **Name:** ${result.data.name || 'Not found'}
          - **Email:** ${result.data.email || 'Not found'}
          - **Phone:** ${result.data.phone || 'Not found'}
          - **Experience:** ${result.data.experience || 'Not specified'}
          - **Location:** ${result.data.location || 'Not specified'}
          
          **Skills Identified:** ${result.data.skills ? result.data.skills.join(', ') : 'None identified'}
          
          **Education:** ${result.data.education || 'Not specified'}
          
          **Work History:** ${result.data.workHistory ? result.data.workHistory.length + ' positions found' : 'None found'}
          
          **Projects:** ${result.data.projects ? result.data.projects.length + ' projects found' : 'None found'}
          
          **Certifications:** ${result.data.certifications ? result.data.certifications.join(', ') : 'None found'}
          
          **Languages:** ${result.data.languages ? result.data.languages.join(', ') : 'Not specified'}
          
          **Summary:** ${result.data.summary || 'No summary available'}
          
          **LinkedIn:** ${result.data.linkedinUrl || 'Not found'}
        `);
        
        // Auto-fill form with parsed data
        setCandidate(prev => ({
          ...prev,
          name: result.data.name || prev.name,
          email: result.data.email || prev.email,
          phone: result.data.phone || prev.phone,
          linkedinUrl: result.data.linkedinUrl || prev.linkedinUrl,
          location: result.data.location || prev.location,
          skills: result.data.skills ? JSON.stringify(result.data.skills) : prev.skills,
          experience: result.data.experience || prev.experience,
          education: result.data.education || prev.education,
          summary: result.data.summary || prev.summary,
          workHistory: result.data.workHistory ? JSON.stringify(result.data.workHistory) : prev.workHistory,
          projects: result.data.projects ? JSON.stringify(result.data.projects) : prev.projects,
          certifications: result.data.certifications ? JSON.stringify(result.data.certifications) : prev.certifications,
          languages: result.data.languages ? JSON.stringify(result.data.languages) : prev.languages,
          notes: result.data.summary || prev.notes,
          resumeUrl: result.data.resumeUrl || prev.resumeUrl
        }));
      } else {
        setResumeAnalysis('Resume parsing completed but no data was extracted.');
      }
    } catch (error) {
      console.error('Resume analysis failed:', error);
      setResumeAnalysis(`**Error:** ${error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.'}`);
    } finally {
      setAnalyzing(false);
    }
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
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          linkedinUrl: candidate.linkedinUrl,
          resumeUrl: candidate.resumeUrl,
          location: candidate.location,
          skills: candidate.skills,
          experience: candidate.experience,
          education: candidate.education,
          summary: candidate.summary,
          workHistory: candidate.workHistory,
          projects: candidate.projects,
          certifications: candidate.certifications,
          languages: candidate.languages,
          jobId: candidate.jobId,
          status: 'pending'
        }),
      });

      if (response.ok) {
        // Redirect back to the job's candidates view if jobId is present
        const jobIdFromUrl = searchParams.get('jobId');
        if (jobIdFromUrl) {
          router.push(`/jobs/${jobIdFromUrl}?tab=candidates`);
        } else {
          router.push('/candidates');
        }
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
          <p className="text-gray-600 mt-2">
            Add a candidate manually or upload their resume for AI analysis
            {selectedJob && (
              <span className="block text-blue-600 font-medium mt-1">
                For position: {selectedJob.title}
              </span>
            )}
          </p>
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
                <Label htmlFor="resume">Upload Resume</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="resume" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, TXT (max 10MB)
                    </p>
                  </label>
                </div>
                
                {resumeFile && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 flex-1">{resumeFile.name}</span>
                    <span className="text-xs text-gray-500">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResumeFile(null);
                        setResumeAnalysis('');
                        setCandidate(prev => ({ ...prev, resumeUrl: '' }));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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

              {candidate.resumeUrl && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resume File
                  </h4>
                  <div className="flex items-center gap-2">
                    <a 
                      href={candidate.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      View Resume File
                    </a>
                    <span className="text-xs text-blue-600">
                      ({resumeFile?.name || 'Resume file'})
                    </span>
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

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={candidate.location}
                  onChange={(e) => setCandidate({ ...candidate, location: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Input
                  id="experience"
                  value={candidate.experience}
                  onChange={(e) => setCandidate({ ...candidate, experience: e.target.value })}
                  placeholder="5 years, Senior level, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={candidate.education}
                  onChange={(e) => setCandidate({ ...candidate, education: e.target.value })}
                  placeholder="Bachelor of Science in Computer Science"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={candidate.skills}
                  onChange={(e) => setCandidate({ ...candidate, skills: e.target.value })}
                  placeholder="JavaScript, React, Node.js, Python"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input
                  id="languages"
                  value={candidate.languages}
                  onChange={(e) => setCandidate({ ...candidate, languages: e.target.value })}
                  placeholder="English, Spanish, French"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Input
                  id="certifications"
                  value={candidate.certifications}
                  onChange={(e) => setCandidate({ ...candidate, certifications: e.target.value })}
                  placeholder="AWS Certified, PMP, Google Cloud Professional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={candidate.summary}
                  onChange={(e) => setCandidate({ ...candidate, summary: e.target.value })}
                  placeholder="Brief professional summary or objective..."
                  rows={3}
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
              {jobs.length === 0 ? (
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  <span>Loading jobs...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                </div>
              ) : (
                <Select 
                  value={candidate.jobId || ""} 
                  onValueChange={(value) => setCandidate({ ...candidate, jobId: value })}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder="Select a job position"
                    />
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
              )}
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500">
                  Debug: Selected jobId = {candidate.jobId || 'none'}, Jobs loaded = {jobs.length}
                </div>
              )}
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

export default function AddCandidatePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AddCandidateForm />
    </Suspense>
  );
}
