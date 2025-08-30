import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Recruiter - Smart Hiring Platform",
  description: "AI-powered recruiting platform to streamline your hiring process. Find the best candidates with intelligent matching and automated outreach.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["AI Recruiter", "Hiring Platform", "Job Board", "Recruitment", "HR Technology", "Talent Acquisition"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body className={geistSans.variable}>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <a className="navbar-brand fw-bold" href="/">
              <i className="bi bi-people-fill me-2"></i>
              AI Recruiter
            </a>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    <i className="bi bi-house-door me-1"></i>
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/jobs/new">
                    <i className="bi bi-plus-circle me-1"></i>
                    Add Job
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/ai-assistant">
                    <i className="bi bi-robot me-1"></i>
                    AI Assistant
                  </a>
                </li>
              </ul>
              <ul className="navbar-nav">
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    Account
                  </a>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="/profile">Profile</a></li>
                    <li><a className="dropdown-item" href="/settings">Settings</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="/logout">Logout</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow-1">
          {children}
        </main>
        
        <footer className="bg-dark text-white py-4 mt-5">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h5>AI Recruiter</h5>
                <p className="mb-0">Smart hiring made simple.</p>
              </div>
              <div className="col-md-6 text-md-end">
                <small>&copy; 2024 AI Recruiter. All rights reserved.</small>
              </div>
            </div>
          </div>
        </footer>
        
        <Analytics />
      </body>
    </html>
  );
}
