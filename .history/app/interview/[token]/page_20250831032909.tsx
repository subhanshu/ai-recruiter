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
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading interview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="text-danger" style={{ fontSize: '4rem' }}>⚠️</div>
            <h1 className="h2 fw-bold text-dark mb-3">Interview Link Error</h1>
            <p className="text-muted mb-4">{error}</p>
            <p className="small text-muted">
              Please contact the recruiter for a new interview link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!outreachLink || !job || !candidate) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="text-danger" style={{ fontSize: '4rem' }}>❌</div>
            <h1 className="h2 fw-bold text-dark mb-3">Interview Not Found</h1>
            <p className="text-muted">The requested interview could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card border-0 shadow mb-4">
        <div className="card-header bg-dark text-white">
          <h1 className="card-title mb-0 h3">
            <i className="bi bi-camera-video me-2"></i>
            AI Interview Session
          </h1>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <h5 className="text-primary">
                <i className="bi bi-briefcase me-2"></i>
                Job Details
              </h5>
              <p className="mb-1"><strong>Title:</strong> {job.title}</p>
              <p className="mb-0 text-muted">{job.description}</p>
            </div>
            <div className="col-md-6 mb-3">
              <h5 className="text-info">
                <i className="bi bi-person me-2"></i>
                Candidate Details
              </h5>
              <p className="mb-1"><strong>Name:</strong> {candidate.name}</p>
              <p className="mb-0 text-muted">{candidate.email}</p>
            </div>
          </div>
        </div>
      </div>
      
      <InterviewDemo 
        jobTitle={job.title}
        jobDescription={job.description}
      />
    </div>
  );
}


