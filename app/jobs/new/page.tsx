"use client";

import { useState } from "react";

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
      window.location.href = "/dashboard";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold mb-6">Create Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Job Title</label>
          <input
            className="w-full border rounded-md px-3 py-2 bg-background"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Senior Backend Engineer"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Job Description (paste JD)</label>
          <textarea
            className="w-full min-h-60 border rounded-md px-3 py-2 bg-background"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste JD here..."
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-md border"
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
            {loading ? 'Parsing…' : 'AI: Parse & Suggest Questions'}
          </button>
        </div>
        {questions.length > 0 && (
          <div>
            <label className="block text-sm mb-2">Suggested Questions</label>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground mt-1">{i + 1}.</span>
                  <input
                    className="flex-1 border rounded-md px-3 py-2 bg-background"
                    value={q}
                    onChange={(e) => {
                      const copy = [...questions];
                      copy[i] = e.target.value;
                      setQuestions(copy);
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          disabled={loading}
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}


