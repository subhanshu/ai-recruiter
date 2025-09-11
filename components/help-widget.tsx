"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  X, 
  BookOpen, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Lightbulb,
  Video,
  Users,
  Briefcase,
  BarChart3
} from "lucide-react";
import Link from "next/link";

interface HelpWidgetProps {
  context?: string;
  className?: string;
}

const contextualHelp = {
  dashboard: {
    title: "Dashboard Help",
    description: "Get the most out of your recruitment dashboard",
    tips: [
      "View key metrics and recent activity at a glance",
      "Use quick actions to create jobs and add candidates",
      "Monitor your candidate pipeline and interview progress",
      "Check AI recommendations for better hiring decisions"
    ],
    relatedSections: [
      { title: "Getting Started", href: "/help#getting-started", icon: <BookOpen className="w-4 h-4" /> },
      { title: "Job Management", href: "/help#job-management", icon: <Briefcase className="w-4 h-4" /> },
      { title: "Candidate Pipeline", href: "/help#candidate-management", icon: <Users className="w-4 h-4" /> }
    ]
  },
  jobs: {
    title: "Job Management Help",
    description: "Learn how to create and manage job postings effectively",
    tips: [
      "Use AI to automatically parse job descriptions and extract key details",
      "Review and customize AI-generated screening questions",
      "Track candidate applications and interview progress per job",
      "Archive completed jobs to keep your dashboard organized"
    ],
    relatedSections: [
      { title: "Creating Jobs", href: "/help#job-management", icon: <Briefcase className="w-4 h-4" /> },
      { title: "AI Question Generation", href: "/help#job-management", icon: <Lightbulb className="w-4 h-4" /> },
      { title: "Job Analytics", href: "/help#evaluation-scoring", icon: <BarChart3 className="w-4 h-4" /> }
    ]
  },
  candidates: {
    title: "Candidate Management Help",
    description: "Manage your candidate pipeline and recruitment process",
    tips: [
      "Use bulk upload for efficient candidate import from CSV/Excel files",
      "Track candidates through different stages using the Kanban board",
      "Let AI parse resumes and extract key information automatically",
      "Set up automated outreach to engage candidates effectively"
    ],
    relatedSections: [
      { title: "Adding Candidates", href: "/help#candidate-management", icon: <Users className="w-4 h-4" /> },
      { title: "Bulk Upload", href: "/help#candidate-management", icon: <Users className="w-4 h-4" /> },
      { title: "Pipeline Management", href: "/help#candidate-management", icon: <Users className="w-4 h-4" /> }
    ]
  },
  interviews: {
    title: "AI Interview Help",
    description: "Conduct and manage AI-powered candidate interviews",
    tips: [
      "Generate secure interview links for each candidate",
      "AI conducts natural conversations and asks relevant questions",
      "Review recordings with synchronized transcripts and AI summaries",
      "Use AI scoring to objectively evaluate candidate performance"
    ],
    relatedSections: [
      { title: "Setting Up Interviews", href: "/help#ai-interviews", icon: <Video className="w-4 h-4" /> },
      { title: "Conducting Interviews", href: "/help#ai-interviews", icon: <Video className="w-4 h-4" /> },
      { title: "Reviewing Results", href: "/help#ai-interviews", icon: <Video className="w-4 h-4" /> }
    ]
  },
  evaluation: {
    title: "Evaluation & Scoring Help",
    description: "Understand AI-powered candidate evaluation and scoring",
    tips: [
      "AI analyzes interview responses against job requirements",
      "Get objective scores across technical skills, communication, and cultural fit",
      "Review detailed evaluation reports with strengths and weaknesses",
      "Compare candidates side-by-side for informed hiring decisions"
    ],
    relatedSections: [
      { title: "AI Scoring", href: "/help#evaluation-scoring", icon: <BarChart3 className="w-4 h-4" /> },
      { title: "Evaluation Reports", href: "/help#evaluation-scoring", icon: <BarChart3 className="w-4 h-4" /> },
      { title: "Customizing Criteria", href: "/help#evaluation-scoring", icon: <BarChart3 className="w-4 h-4" /> }
    ]
  }
};

export function HelpWidget({ context = "dashboard", className = "" }: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const helpData = contextualHelp[context as keyof typeof contextualHelp] || contextualHelp.dashboard;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Help Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
          size="icon"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Help Panel */}
      {isOpen && (
        <Card className="w-80 shadow-2xl border-0 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{helpData.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-sm">
              {helpData.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Quick Tips */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                Quick Tips
              </h4>
              <div className="space-y-1">
                {helpData.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-gray-600">
                    <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Sections */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Help</h4>
              <div className="space-y-1">
                {helpData.relatedSections.map((section, index) => (
                  <Link
                    key={index}
                    href={section.href}
                    className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {section.icon}
                    {section.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t space-y-2">
              <Link href="/help" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Full Help
                </Button>
              </Link>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Context-specific help widgets for different pages
export function DashboardHelpWidget() {
  return <HelpWidget context="dashboard" />;
}

export function JobsHelpWidget() {
  return <HelpWidget context="jobs" />;
}

export function CandidatesHelpWidget() {
  return <HelpWidget context="candidates" />;
}

export function InterviewsHelpWidget() {
  return <HelpWidget context="interviews" />;
}

export function EvaluationHelpWidget() {
  return <HelpWidget context="evaluation" />;
}
