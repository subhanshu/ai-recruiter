'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase-client';

interface OutreachLink {
  id: string;
  token: string;
  candidate_id: string;
  job_id: string;
  status: string;
  expires_at: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  jd_raw: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
}

// Simple Interview Demo Component
function InterviewDemo({ jobTitle, jobDescription }: { jobTitle: string; jobDescription: string }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Interview Demo</h2>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Job Context</h3>
          <p className="text-blue-800"><strong>Position:</strong> {jobTitle}</p>
          <p className="text-blue-800"><strong>Description:</strong> {jobDescription}</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Interview Status</h3>
          <p className="text-green-800">AI Interview system is ready to begin.</p>
          <p className="text-green-800 text-sm mt-2">
            This is a demo interface. In the full version, you would see:
          </p>
          <ul className="text-green-800 text-sm mt-2 list-disc list-inside">
            <li>Real-time voice/video interview</li>
            <li>AI-generated questions based on job requirements</li>
            <li>Live transcription and analysis</li>
            <li>Candidate evaluation and scoring</li>
          </ul>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Next Steps</h3>
          <p className="text-yellow-800">
            To implement the full AI interview functionality, you would need to:
          </p>
          <ul className="text-yellow-800 text-sm mt-2 list-disc list-inside">
            <li>Integrate OpenAI&apos;s real-time API for live interviews</li>
            <li>Add WebRTC for audio/video streaming</li>
            <li>Implement question generation based on job requirements</li>
            <li>Add candidate evaluation algorithms</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const [outreachLink, setOutreachLink] = useState<OutreachLink | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useParams() as { token: string };

  const fetchInterviewData = useCallback(async () => {
    try {
      // Fetch outreach link
      const { data: linkData, error: linkError } = await supabaseClient
        .from('OutreachLink')
        .select('*')
        .eq('token', token)
        .eq('status', 'active')
        .single();

      if (linkError || !linkData) {
        setError('Invalid or expired interview link');
        setLoading(false);
        return;
      }

      // Check if link is expired
      if (new Date(linkData.expires_at) < new Date()) {
        setError('Interview link has expired');
        setLoading(false);
        return;
      }

      setOutreachLink(linkData);

      // Fetch job details
      const { data: jobData, error: jobError } = await supabaseClient
        .from('Job')
        .select('*')
        .eq('id', linkData.job_id)
        .single();

      if (jobError || !jobData) {
        setError('Job not found');
        setLoading(false);
        return;
      }

      setJob(jobData);

      // Fetch candidate details
      const { data: candidateData, error: candidateError } = await supabaseClient
        .from('Candidate')
        .select('*')
        .eq('id', linkData.candidate_id)
        .single();

      if (candidateError || !candidateData) {
        setError('Candidate not found');
        setLoading(false);
        return;
      }

      setCandidate(candidateData);
    } catch (error) {
      console.error('Error fetching interview data:', error);
      setError('Failed to load interview data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInterviewData();
  }, [fetchInterviewData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Link Error</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Please contact the recruiter for a new interview link.
          </p>
        </div>
      </div>
    );
  }

  if (!outreachLink || !job || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Not Found</h1>
          <p className="text-gray-600">The requested interview could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">AI Interview Session</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Job Details</h3>
                <p className="text-gray-600"><strong>Title:</strong> {job.title}</p>
                <p className="text-gray-600"><strong>Description:</strong> {job.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Candidate Details</h3>
                <p className="text-gray-600"><strong>Name:</strong> {candidate.name}</p>
                <p className="text-gray-600"><strong>Email:</strong> {candidate.email}</p>
              </div>
            </div>
          </div>
          
          <InterviewDemo 
            jobTitle={job.title}
            jobDescription={job.description}
          />
        </div>
      </div>
    </div>
  );
}


