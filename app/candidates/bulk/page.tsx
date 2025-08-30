'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

export default function BulkUploadPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState<CandidateImport[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

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

  const handleImport = async () => {
    if (!selectedJobId) return;

    setImporting(true);
    setProgress(0);

    const validCandidates = candidates.filter(c => c.status === 'valid');
    
    for (let i = 0; i < validCandidates.length; i++) {
      const candidate = validCandidates[i];
      
      try {
        const response = await fetch('/api/candidates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...candidate,
            jobId: selectedJobId,
            status: 'pending'
          }),
        });

        if (response.ok) {
          setCandidates(prev => prev.map(c => 
            c === candidate ? { ...c, status: 'valid' } : c
          ));
        }
      } catch (error) {
        console.error('Error importing candidate:', error);
      }

      setProgress(((i + 1) / validCandidates.length) * 100);
    }

    setImporting(false);
    setTimeout(() => {
      router.push('/candidates');
    }, 2000);
  };

  const validCount = candidates.filter(c => c.status === 'valid').length;
  const invalidCount = candidates.filter(c => c.status === 'invalid').length;

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
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Candidates</h1>
          <p className="text-gray-600 mt-2">Upload multiple candidates from CSV or Excel file</p>
        </div>
      </div>

      {!previewMode ? (
        <div className="space-y-8">
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

            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
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
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Import Progress */}
          {importing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Importing candidates...</span>
                    <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
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
                    disabled={validCount === 0 || !selectedJobId || importing}
                    className="flex-1"
                  >
                    {importing ? (
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
                    disabled={importing}
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
