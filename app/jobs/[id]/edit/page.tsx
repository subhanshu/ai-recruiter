"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  jdRaw: string;
  questions: string[];
  department?: string;
  location?: string;
  status?: string;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [jd, setJd] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setFetchingJob(true);
      const response = await fetch(`/api/jobs/${jobId}`);
      if (response.ok) {
        const jobData = await response.json();
        setJob(jobData);
        setTitle(jobData.title || '');
        setJd(jobData.jdRaw || '');
        setQuestions(jobData.questions || []);
      } else {
        // Fallback to mock data if API fails
        const mockJob: Job = {
          id: jobId,
          title: "Senior Software Engineer",
          jdRaw: "We are looking for a Senior Software Engineer to join our team...",
          questions: [
            "Tell me about your experience with React and TypeScript",
            "How do you approach debugging complex issues?",
            "Describe a challenging project you've worked on"
          ],
          department: "Engineering",
          location: "San Francisco, CA",
          status: "active"
        };
        setJob(mockJob);
        setTitle(mockJob.title);
        setJd(mockJob.jdRaw);
        setQuestions(mockJob.questions);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Failed to load job details');
    } finally {
      setFetchingJob(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, jdRaw: jd, questions }),
      });
      if (!res.ok) throw new Error("Failed to update job");
      router.push(`/jobs/${jobId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (fetchingJob) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading job details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow">
              <div className="card-body text-center py-5">
                <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">Job Not Found</h3>
                <p className="text-muted">The job you're trying to edit could not be found.</p>
                <Link href="/jobs" className="btn btn-primary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow">
            <div className="card-header bg-primary text-white">
              <h1 className="card-title mb-0 h4">
                <i className="bi bi-pencil-square me-2"></i>
                Edit Job: {job.title}
              </h1>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="jobTitle" className="form-label fw-semibold">
                    Job Title <span className="text-danger">*</span>
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Backend Engineer"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="jobDescription" className="form-label fw-semibold">
                    Job Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="jobDescription"
                    className="form-control"
                    rows={10}
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste your job description here..."
                    required
                  />
                  <div className="form-text">
                    Update the job description. Our AI can re-analyze it and suggest new interview questions.
                  </div>
                </div>

                <div className="mb-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        const r = await fetch('/api/ai/parse-jd', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ jd })
                        });
                        if (!r.ok) throw new Error('Failed to parse JD');
                        const data = await r.json();
                        if (data.title) setTitle(data.title);
                        if (Array.isArray(data.questions)) setQuestions(data.questions);
                      } catch (e) {
                        const message = e instanceof Error ? e.message : 'Error';
                        setError(message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading || !jd}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-2"></i>
                        AI: Re-analyze & Update Questions
                      </>
                    )}
                  </button>
                </div>

                {questions.length > 0 && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-question-circle me-2"></i>
                      Interview Questions
                    </label>
                    <div className="card bg-light">
                      <div className="card-body">
                        {questions.map((q, i) => (
                          <div key={i} className="mb-3">
                            <div className="d-flex align-items-center justify-content-between">
                              <label className="form-label small text-muted mb-1">Question {i + 1}</label>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  const copy = questions.filter((_, index) => index !== i);
                                  setQuestions(copy);
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                            <input
                              type="text"
                              className="form-control"
                              value={q}
                              onChange={(e) => {
                                const copy = [...questions];
                                copy[i] = e.target.value;
                                setQuestions(copy);
                              }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setQuestions([...questions, ""])}
                        >
                          <i className="bi bi-plus me-2"></i>
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <div className="d-flex gap-2 justify-content-end">
                  <Link href={`/jobs/${jobId}`} className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Job
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
