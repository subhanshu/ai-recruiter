'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: string;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    pendingInterviews: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabaseClient
        .from('Job')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
      } else {
        setJobs(jobsData || []);
      }

      // Fetch candidates (mock data if table doesn't exist)
      const mockCandidates = [
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'pending' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'interviewed' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', status: 'hired' },
      ];
      setCandidates(mockCandidates);

      // Calculate stats
      const totalJobs = jobsData?.length || 0;
      const activeJobs = jobsData?.filter(job => job.status === 'active').length || 0;
      
      setStats({
        totalJobs,
        activeJobs,
        totalCandidates: mockCandidates.length,
        pendingInterviews: mockCandidates.filter(c => c.status === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="bg-primary text-white rounded-3 p-5">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="display-5 fw-bold mb-3">Welcome to AI Recruiter</h1>
                <p className="lead mb-4">
                  Streamline your hiring process with intelligent candidate matching and automated workflows.
                </p>
                <Link href="/jobs/new" className="btn btn-light btn-lg">
                  <i className="bi bi-plus-circle me-2"></i>
                  Post New Job
                </Link>
              </div>
              <div className="col-md-4 text-center">
                <i className="bi bi-people-fill display-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-briefcase-fill text-primary fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.totalJobs}</h3>
              <p className="text-muted mb-0">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.activeJobs}</h3>
              <p className="text-muted mb-0">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-people-fill text-info fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.totalCandidates}</h3>
              <p className="text-muted mb-0">Candidates</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-clock-fill text-warning fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.pendingInterviews}</h3>
              <p className="text-muted mb-0">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Jobs */}
        <div className="col-md-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-briefcase me-2"></i>
                  Recent Jobs
                </h5>
                <Link href="/jobs" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              {jobs.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-briefcase display-4 text-muted mb-3"></i>
                  <h6 className="text-muted">No jobs yet</h6>
                  <p className="text-muted mb-4">Get started by creating your first job posting.</p>
                  <Link href="/jobs/new" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Job
                  </Link>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {jobs.map((job: Job) => (
                    <div key={job.id} className="list-group-item border-0">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                            <i className="bi bi-briefcase text-primary"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 fw-semibold">{job.title}</h6>
                          <p className="mb-1 text-muted small">{job.description}</p>
                          <small className="text-muted">
                            {new Date(job.created_at).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`badge ${
                            job.status === 'active' 
                              ? 'bg-success' 
                              : 'bg-secondary'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-people me-2"></i>
                Recent Candidates
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="list-group-item border-0">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-info bg-opacity-10 p-2">
                          <i className="bi bi-person text-info"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1 fw-semibold">{candidate.name}</h6>
                        <p className="mb-0 text-muted small">{candidate.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`badge ${
                          candidate.status === 'hired' ? 'bg-success' :
                          candidate.status === 'interviewed' ? 'bg-info' :
                          'bg-warning'
                        }`}>
                          {candidate.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <Link href="/jobs/new" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i className="bi bi-plus-circle fs-1 mb-2"></i>
                    <span>Post New Job</span>
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link href="/candidates" className="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i className="bi bi-search fs-1 mb-2"></i>
                    <span>Find Candidates</span>
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link href="/ai-assistant" className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i className="bi bi-robot fs-1 mb-2"></i>
                    <span>AI Assistant</span>
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <Link href="/reports" className="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                    <i className="bi bi-graph-up fs-1 mb-2"></i>
                    <span>View Reports</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}