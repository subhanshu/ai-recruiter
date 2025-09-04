"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewJobPage() {
  const [jd, setJd] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // naive question generation via API route (to be implemented with OpenAI)
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, jdRaw: jd, questions }),
      });
      if (!res.ok) throw new Error("Failed to create job");
      window.location.href = "/";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow">
            <div className="card-header bg-primary text-white">
              <h1 className="card-title mb-0 h4">
                <i className="bi bi-plus-circle me-2"></i>
                Create New Job
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
                    Paste the complete job description. Our AI will analyze it and suggest interview questions.
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
                        AI: Parse & Generate Screening Questions
                      </>
                    )}
                  </button>
                </div>

                {questions.length > 0 && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-question-circle me-2"></i>
                      AI-Generated Interview Questions
                    </label>
                    <div className="card bg-light">
                      <div className="card-body">
                        {questions.map((q, i) => (
                          <div key={i} className="mb-3">
                            <label className="form-label small text-muted">Question {i + 1}</label>
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
                  <Link href="/" className="btn btn-outline-secondary">
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Job
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


