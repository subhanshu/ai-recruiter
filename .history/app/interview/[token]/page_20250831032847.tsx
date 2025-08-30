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
    <div className="card border-0 shadow">
      <div className="card-header bg-primary text-white">
        <h2 className="card-title mb-0 h5">
          <i className="bi bi-camera-video me-2"></i>
          AI Interview Demo
        </h2>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-12">
            <div className="alert alert-info border-0" role="alert">
              <h4 className="alert-heading">
                <i className="bi bi-info-circle me-2"></i>
                Job Context
              </h4>
              <p className="mb-1"><strong>Position:</strong> {jobTitle}</p>
              <p className="mb-0"><strong>Description:</strong> {jobDescription}</p>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="alert alert-success border-0" role="alert">
              <h5 className="alert-heading">
                <i className="bi bi-check-circle me-2"></i>
                Interview Status
              </h5>
              <p>AI Interview system is ready to begin.</p>
              <p className="small mb-2">
                This is a demo interface. In the full version, you would see:
              </p>
              <ul className="small mb-0">
                <li>Real-time voice/video interview</li>
                <li>AI-generated questions based on job requirements</li>
                <li>Live transcription and analysis</li>
                <li>Candidate evaluation and scoring</li>
              </ul>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="alert alert-warning border-0" role="alert">
              <h5 className="alert-heading">
                <i className="bi bi-gear me-2"></i>
                Implementation Notes
              </h5>
              <p className="small">
                To implement the full AI interview functionality:
              </p>
              <ul className="small mb-0">
                <li>Integrate OpenAI&apos;s real-time API for live interviews</li>
                <li>Add WebRTC for audio/video streaming</li>
                <li>Implement question generation based on job requirements</li>
                <li>Add candidate evaluation algorithms</li>
              </ul>
            </div>
          </div>
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


