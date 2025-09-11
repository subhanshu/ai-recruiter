'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BulkUploadProgress } from '@/components/bulk-upload-progress';
import { useBulkUpload } from '@/hooks/use-bulk-upload';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle,
  X,
  Users,
  Bot,
  AlertCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
}

interface CandidateImport {
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  status: 'pending' | 'valid' | 'invalid' | 'duplicate';
  errors: string[];
}

function BulkUploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { job, isUploading, progress, error, startBulkUpload, clearJob } = useBulkUpload();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [candidates, setCandidates] = useState<CandidateImport[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadMode, setUploadMode] = useState<'csv' | 'resumes'>('csv');

  useEffect(() => {
    fetchJobs();
    
    // Handle jobId from URL parameters
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl) {
      setSelectedJobId(jobIdFromUrl);
    }
  }, [searchParams]);

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
      setJobs([
        { id: '1', title: 'Senior Frontend Developer', department: 'Engineering', location: 'San Francisco, CA' },
        { id: '2', title: 'Product Manager', department: 'Product', location: 'New York, NY' },
        { id: '3', title: 'UX Designer', department: 'Design', location: 'Remote' }
      ]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Name,Email,Phone,LinkedIn URL\nJohn Doe,john.doe@example.com,+1-555-123-4567,https://linkedin.com/in/johndoe\nJane Smith,jane.smith@example.com,+1-555-234-5678,https://linkedin.com/in/janesmith';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): CandidateImport[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const emailIndex = headers.findIndex(h => h.includes('email'));
    const phoneIndex = headers.findIndex(h => h.includes('phone'));
    const linkedinIndex = headers.findIndex(h => h.includes('linkedin'));

    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const candidate: CandidateImport = {
          name: values[nameIndex] || '',
          email: values[emailIndex] || '',
          phone: values[phoneIndex] || '',
          linkedinUrl: values[linkedinIndex] || '',
          status: 'pending',
          errors: []
        };

        // Validate candidate data
        if (!candidate.name) candidate.errors.push('Name is required');
        if (!candidate.email) candidate.errors.push('Email is required');
        if (candidate.email && !candidate.email.includes('@')) candidate.errors.push('Invalid email format');
        
        candidate.status = candidate.errors.length > 0 ? 'invalid' : 'valid';
        
        return candidate;
      });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedCandidates = parseCSV(text);
      setCandidates(parsedCandidates);
      setPreviewMode(true);
    };
    reader.readAsText(uploadedFile);
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });
    
    setResumeFiles(validFiles);
    setCandidates([]);
    setPreviewMode(false);
  };

  const processResumes = async () => {
    if (!selectedJobId || resumeFiles.length === 0) return;
    
    try {
      const jobId = await startBulkUpload(selectedJobId, undefined, resumeFiles);
      if (jobId) {
        setPreviewMode(true);
      }
    } catch (error) {
      console.error('Failed to start bulk upload:', error);
    }
  };

  const handleImport = async () => {
    if (!selectedJobId) return;

    try {
      const jobId = await startBulkUpload(selectedJobId, candidates);
      if (jobId) {
        setPreviewMode(true);
      }
    } catch (error) {
      console.error('Failed to start bulk upload:', error);
    }
  };

  const validCount = candidates.filter(c => c.status === 'valid').length;
  const invalidCount = candidates.filter(c => c.status === 'invalid').length;

  // Determine back button destination
  const getBackUrl = () => {
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl) {
      return `/jobs/${jobIdFromUrl}?tab=candidates`;
    }
    return '/candidates';
  };

  const getBackText = () => {
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl) {
      return '← Back to Job';
    }
    return '← Back to Candidates';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={getBackUrl()}>
              <Button variant="ghost" size="sm">
                {getBackText()}
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Candidates</h1>
          <p className="text-gray-600 mt-2">Upload multiple candidates from CSV file or individual resumes</p>
        </div>
      </div>

      {!previewMode ? (
        <div className="space-y-8">
          {/* Upload Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Upload Method</CardTitle>
              <CardDescription>
                Select how you want to upload candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    uploadMode === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUploadMode('csv')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium">CSV Upload</h3>
                      <p className="text-sm text-gray-600">Upload candidates from a CSV file</p>
                    </div>
                  </div>
                </div>
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    uploadMode === 'resumes' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUploadMode('resumes')}
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-medium">Resume Upload</h3>
                      <p className="text-sm text-gray-600">Upload multiple resumes for AI parsing</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Instructions</CardTitle>
              <CardDescription>
                Follow these steps to bulk upload candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Download Template</h4>
                    <p className="text-sm text-gray-600">Get the CSV template with required columns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Fill Data</h4>
                    <p className="text-sm text-gray-600">Add candidate information to the template</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Upload File</h4>
                    <p className="text-sm text-gray-600">Upload your CSV file for processing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Download Template</CardTitle>
                <CardDescription>
                  Get the CSV template with the correct format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadTemplate} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Required columns: Name, Email, Phone (optional), LinkedIn URL (optional)
                </p>
              </CardContent>
            </Card>

            {uploadMode === 'csv' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>
                    Select your CSV or Excel file with candidate data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Choose File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job">Job Position</Label>
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job position" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title}
                            {job.department && ` - ${job.department}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {file && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Upload Resumes for AI Parsing
                  </CardTitle>
                  <CardDescription>
                    Upload multiple resume files (PDF, DOC, DOCX) and let AI extract candidate information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-resumes">Job Position</Label>
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job position" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title}
                            {job.department && ` - ${job.department}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resumes">Upload Resume Files</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Input
                        id="resumes"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeUpload}
                        multiple
                        className="hidden"
                      />
                      <label htmlFor="resumes" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop multiple resumes
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX (max 10MB each)
                        </p>
                      </label>
                    </div>
                  </div>

                  {resumeFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files ({resumeFiles.length})</Label>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {resumeFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        onClick={processResumes} 
                        disabled={!selectedJobId || isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Bot className="w-4 h-4 mr-2 animate-spin" />
                            Processing Resumes...
                          </>
                        ) : (
                          <>
                            <Bot className="w-4 h-4 mr-2" />
                            Process with AI
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing resumes...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Background Processing Progress */}
          {job && (
            <BulkUploadProgress 
              job={job} 
              onClose={() => {
                clearJob();
                setPreviewMode(false);
                if (job.status === 'completed') {
                  router.push(getBackUrl());
                }
              }} 
            />
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Upload Error</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Preview Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Import Preview</CardTitle>
                  <CardDescription>
                    Review candidates before importing
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {validCount} Valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {invalidCount} Invalid
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  {candidates.map((candidate, index) => (
                    <div key={index} className={`p-3 border rounded-lg mb-2 ${
                      candidate.status === 'valid' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {candidate.status === 'valid' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">{candidate.name || 'No name'}</span>
                          </div>
                          <p className="text-sm text-gray-600">{candidate.email}</p>
                          {candidate.phone && (
                            <p className="text-sm text-gray-600">{candidate.phone}</p>
                          )}
                          {candidate.errors.length > 0 && (
                            <div className="mt-2">
                              {candidate.errors.map((error, i) => (
                                <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {error}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button 
                    onClick={handleImport}
                    disabled={validCount === 0 || !selectedJobId || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Bot className="w-4 h-4 mr-2 animate-spin" />
                        Importing {validCount} candidates...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Import {validCount} Valid Candidates
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setPreviewMode(false)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function BulkUploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BulkUploadPageContent />
    </Suspense>
  );
}
