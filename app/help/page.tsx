"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  MessageSquare, 
  Users, 
  Briefcase, 
  Video, 
  FileText, 
  Settings,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Play,
  Download,
  Upload,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Shield,
  Clock
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const howToSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Play className="w-5 h-5" />,
      color: "bg-blue-500",
      items: [
        {
          title: "Setting up your first job posting",
          description: "Learn how to create and configure your first job posting with AI-powered assistance",
          steps: [
            "Navigate to the Jobs section from the main dashboard",
            "Click 'Add Job' to create a new job posting",
            "Paste your job description in the text area - AI will automatically parse and extract key details",
            "Review and edit the auto-populated fields (title, department, location, skills, qualifications)",
            "Save your job posting to generate AI screening questions",
            "Review and customize the generated questions before finalizing"
          ]
        },
        {
          title: "Creating your first candidate profile",
          description: "Add candidates individually or in bulk to start your recruitment process",
          steps: [
            "Go to the Candidates section from the main navigation",
            "Click 'Add Candidate' for individual entry or 'Bulk Upload' for multiple candidates",
            "Fill in candidate details (name, email, phone, resume, LinkedIn)",
            "For bulk upload, prepare a CSV/Excel file with required columns",
            "Assign candidates to specific job postings",
            "Review candidate information before proceeding to outreach"
          ]
        },
        {
          title: "Understanding the dashboard",
          description: "Navigate and make the most of your recruitment dashboard",
          steps: [
            "View key metrics: total jobs, active candidates, completed interviews",
            "Monitor recent activity and upcoming interviews",
            "Access quick actions for common tasks",
            "Review candidate pipeline and status updates",
            "Check AI assistant recommendations and insights"
          ]
        }
      ]
    },
    {
      id: "job-management",
      title: "Job Management",
      icon: <Briefcase className="w-5 h-5" />,
      color: "bg-green-500",
      items: [
        {
          title: "AI-powered job description parsing",
          description: "Let AI extract key information from your job descriptions automatically",
          steps: [
            "Paste your complete job description in the text area",
            "Click 'Parse with AI' to analyze the content",
            "Review extracted information: job title, department, location, responsibilities",
            "AI identifies required skills, qualifications, and experience levels",
            "Edit any auto-populated fields as needed",
            "Save to proceed with question generation"
          ]
        },
        {
          title: "Generating screening questions",
          description: "Create relevant and effective screening questions using AI",
          steps: [
            "After saving your job posting, AI automatically generates 8-10 screening questions",
            "Questions are tailored to the specific role and requirements",
            "Review each question for relevance and clarity",
            "Edit questions to match your company's interview style",
            "Add custom questions if needed",
            "Save the final question set for candidate interviews"
          ]
        },
        {
          title: "Managing multiple job postings",
          description: "Organize and track multiple job openings efficiently",
          steps: [
            "View all active job postings in the Jobs section",
            "Use filters to sort by department, status, or date created",
            "Edit job details or questions at any time",
            "Track candidate applications per job posting",
            "Archive completed or cancelled job postings",
            "Generate reports on job posting performance"
          ]
        }
      ]
    },
    {
      id: "candidate-management",
      title: "Candidate Management",
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-500",
      items: [
        {
          title: "Bulk candidate upload",
          description: "Import multiple candidates efficiently using CSV/Excel files",
          steps: [
            "Prepare your CSV/Excel file with columns: Name, Email, Phone, Resume URL, LinkedIn URL",
            "Go to Candidates > Bulk Upload",
            "Select your file and upload",
            "Review the preview of imported data",
            "Map columns to the correct fields if needed",
            "Assign candidates to specific job postings",
            "Confirm import to add all candidates to your database"
          ]
        },
        {
          title: "Candidate pipeline management",
          description: "Track candidates through different stages of the recruitment process",
          steps: [
            "View the Kanban board for visual pipeline management",
            "Drag candidates between stages: Applied, Screening, Interviewed, Evaluated, Hired/Rejected",
            "Add notes and comments for each candidate",
            "Set follow-up reminders and tasks",
            "Filter candidates by job posting, status, or date",
            "Export candidate data for external review"
          ]
        },
        {
          title: "Resume parsing and analysis",
          description: "Extract key information from candidate resumes automatically",
          steps: [
            "Upload candidate resumes in PDF, DOC, or DOCX format",
            "AI automatically extracts: contact info, work experience, education, skills",
            "Review parsed information for accuracy",
            "AI identifies relevant experience matching job requirements",
            "Generate candidate summaries for quick review",
            "Flag potential issues or missing information"
          ]
        }
      ]
    },
    {
      id: "ai-interviews",
      title: "AI Interviews",
      icon: <Video className="w-5 h-5" />,
      color: "bg-orange-500",
      items: [
        {
          title: "Setting up AI interviews",
          description: "Configure and launch AI-powered candidate interviews",
          steps: [
            "Select candidates from your pipeline for interview",
            "Choose the job posting and question set",
            "Generate secure, unique interview links for each candidate",
            "Send interview invitations via email or WhatsApp",
            "Configure interview settings (duration, retry attempts, etc.)",
            "Monitor interview progress in real-time"
          ]
        },
        {
          title: "Conducting live AI interviews",
          description: "Guide candidates through the AI interview process",
          steps: [
            "Candidates click the secure interview link",
            "AI agent greets the candidate and explains the process",
            "Questions are asked one by one with natural conversation flow",
            "Both audio and video are recorded for later review",
            "AI adapts follow-up questions based on responses",
            "Interview concludes with next steps and thank you message"
          ]
        },
        {
          title: "Reviewing interview recordings",
          description: "Analyze and evaluate candidate interview performance",
          steps: [
            "Access interview recordings from the Interviews section",
            "Watch video recordings with synchronized transcripts",
            "Review AI-generated summaries and key insights",
            "Check candidate responses against job requirements",
            "Add your own notes and evaluations",
            "Compare candidates side-by-side for final decisions"
          ]
        }
      ]
    },
    {
      id: "evaluation-scoring",
      title: "Evaluation & Scoring",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-red-500",
      items: [
        {
          title: "AI-powered candidate scoring",
          description: "Get objective candidate rankings based on interview performance",
          steps: [
            "AI analyzes interview transcripts and responses",
            "Scores candidates on technical skills, communication, and cultural fit",
            "Compares responses against job requirements and ideal answers",
            "Generates overall suitability scores (1-100)",
            "Provides detailed breakdown of strengths and weaknesses",
            "Ranks candidates automatically for easy comparison"
          ]
        },
        {
          title: "Reviewing evaluation reports",
          description: "Understand and act on AI-generated candidate evaluations",
          steps: [
            "Access detailed evaluation reports for each candidate",
            "Review scores across different competency areas",
            "Read AI-generated summaries and recommendations",
            "Compare candidates using side-by-side analysis",
            "Export reports for stakeholder review",
            "Make informed hiring decisions based on data"
          ]
        },
        {
          title: "Customizing evaluation criteria",
          description: "Adjust scoring criteria to match your company's priorities",
          steps: [
            "Access evaluation settings from the Settings page",
            "Modify weightings for different skill categories",
            "Add custom evaluation criteria specific to your needs",
            "Set minimum score thresholds for different roles",
            "Configure cultural fit assessment parameters",
            "Save changes to apply to future evaluations"
          ]
        }
      ]
    },
    {
      id: "outreach-automation",
      title: "Outreach & Automation",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-teal-500",
      items: [
        {
          title: "Automated candidate outreach",
          description: "Send personalized messages to candidates via email and WhatsApp",
          steps: [
            "Select candidates for outreach from your pipeline",
            "Choose communication channels (email, WhatsApp, or both)",
            "AI generates personalized messages based on job and candidate info",
            "Review and customize message templates",
            "Schedule outreach campaigns for optimal timing",
            "Track delivery status and response rates"
          ]
        },
        {
          title: "Managing interview invitations",
          description: "Send and track secure interview links to candidates",
          steps: [
            "Generate unique, secure interview links for each candidate",
            "Links expire after use or after a set time period",
            "Send invitations with clear instructions and expectations",
            "Track link usage and interview completion status",
            "Send reminder messages for pending interviews",
            "Handle rescheduling requests automatically"
          ]
        },
        {
          title: "Follow-up automation",
          description: "Automate follow-up communications throughout the process",
          steps: [
            "Set up automated follow-up sequences",
            "Configure triggers based on candidate actions",
            "Send thank you messages after interviews",
            "Notify candidates of status updates",
            "Schedule reminder messages for incomplete tasks",
            "Personalize messages based on candidate progress"
          ]
        }
      ]
    }
  ];

  const faqSections = [
    {
      category: "General",
      icon: <HelpCircle className="w-5 h-5" />,
      questions: [
        {
          question: "What is AI Recruiter and how does it work?",
          answer: "AI Recruiter is an intelligent hiring platform that automates the initial screening process using artificial intelligence. It helps you create job postings, generate relevant screening questions, conduct AI-powered interviews, and evaluate candidates objectively. The platform uses OpenAI's advanced models to provide natural conversation flow during interviews and accurate candidate assessments."
        },
        {
          question: "Is my data secure and private?",
          answer: "Yes, we take data security very seriously. All candidate data is encrypted both in transit and at rest. Interview recordings are stored securely in our cloud infrastructure with access controls. We comply with GDPR and other privacy regulations. Candidate interview links are unique and expire after use for maximum security."
        },
        {
          question: "What types of jobs can I post?",
          answer: "AI Recruiter works with any type of job posting across all industries and levels. The AI is trained to understand various job descriptions and can generate appropriate screening questions for technical roles, sales positions, customer service, management positions, and more. The system adapts to your specific requirements and company culture."
        },
        {
          question: "How accurate is the AI evaluation?",
          answer: "Our AI evaluation system provides objective, consistent scoring based on multiple factors including technical knowledge, communication skills, and cultural fit. While AI provides valuable insights and rankings, we recommend using it as a tool to support human decision-making rather than replacing human judgment entirely. The system learns and improves over time."
        }
      ]
    },
    {
      category: "Technical",
      icon: <Settings className="w-5 h-5" />,
      questions: [
        {
          question: "What file formats are supported for resume uploads?",
          answer: "We support PDF, DOC, and DOCX formats for resume uploads. The AI can extract text and key information from these formats automatically. For best results, ensure your resumes are clear, well-formatted, and contain standard sections like work experience, education, and skills."
        },
        {
          question: "What are the system requirements for conducting interviews?",
          answer: "Candidates need a modern web browser (Chrome, Firefox, Safari, or Edge) with a working microphone and camera. A stable internet connection is recommended for smooth video/audio recording. The platform works on desktop computers, tablets, and mobile devices."
        },
        {
          question: "How long are interview recordings stored?",
          answer: "Interview recordings are stored for 90 days by default, but you can adjust this setting based on your company's data retention policies. You can download recordings for permanent storage if needed. All recordings are automatically deleted after the retention period unless you choose to extend storage."
        },
        {
          question: "Can I integrate AI Recruiter with my existing HR systems?",
          answer: "Yes, we offer API access and webhook integrations to connect with popular HR systems, ATS platforms, and other recruitment tools. Contact our support team to discuss specific integration requirements and we'll help you set up the connections."
        }
      ]
    },
    {
      category: "Billing & Plans",
      icon: <Target className="w-5 h-5" />,
      questions: [
        {
          question: "What pricing plans are available?",
          answer: "We offer flexible pricing plans based on your hiring volume. Our Starter plan includes up to 50 interviews per month, while our Professional plan supports up to 500 interviews. Enterprise plans are available for larger organizations with custom features and unlimited interviews. Contact sales for detailed pricing information."
        },
        {
          question: "Can I change my plan anytime?",
          answer: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle. We'll prorate any charges to ensure you only pay for what you use."
        },
        {
          question: "Is there a free trial available?",
          answer: "Yes, we offer a 14-day free trial with full access to all features. No credit card required to start. You can conduct up to 10 interviews during the trial period to evaluate the platform's effectiveness for your hiring needs."
        },
        {
          question: "What happens if I exceed my monthly interview limit?",
          answer: "If you exceed your monthly limit, you'll be notified and can either upgrade your plan or purchase additional interviews on a pay-per-use basis. We'll never interrupt an ongoing interview due to limits."
        }
      ]
    },
    {
      category: "Support",
      icon: <MessageSquare className="w-5 h-5" />,
      questions: [
        {
          question: "How can I get help if I'm having issues?",
          answer: "We offer multiple support channels: 24/7 chat support in the app, email support at help@airecruiter.com, and comprehensive documentation. For urgent issues, you can also schedule a call with our support team. Response times are typically under 2 hours for critical issues."
        },
        {
          question: "Do you provide training for my team?",
          answer: "Yes, we offer comprehensive onboarding and training sessions for your team. This includes live demonstrations, best practices workshops, and ongoing support. We also provide training materials and video tutorials to help your team get the most out of the platform."
        },
        {
          question: "Can I request new features?",
          answer: "Absolutely! We value customer feedback and regularly add new features based on user requests. You can submit feature requests through the app's feedback system, or contact our product team directly. We review all requests and prioritize based on user demand and technical feasibility."
        },
        {
          question: "What if I need to cancel my subscription?",
          answer: "You can cancel your subscription at any time from your account settings. Your data will remain accessible for 30 days after cancellation, giving you time to export any information you need. We don't charge cancellation fees and will refund any unused portion of your current billing period."
        }
      ]
    }
  ];

  const quickLinks = [
    { title: "Getting Started Guide", href: "#getting-started", icon: <Play className="w-4 h-4" /> },
    { title: "Job Management", href: "#job-management", icon: <Briefcase className="w-4 h-4" /> },
    { title: "Candidate Pipeline", href: "#candidate-management", icon: <Users className="w-4 h-4" /> },
    { title: "AI Interviews", href: "#ai-interviews", icon: <Video className="w-4 h-4" /> },
    { title: "Evaluation Reports", href: "#evaluation-scoring", icon: <BarChart3 className="w-4 h-4" /> },
    { title: "Contact Support", href: "#support", icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const filteredHowToSections = howToSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  const filteredFaqSections = faqSections.map(section => ({
    ...section,
    questions: section.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
              <p className="text-gray-600">Everything you need to know about AI Recruiter</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search help articles, FAQs, and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {link.icon}
                    {link.title}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <Button className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Schedule Demo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="how-to" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="how-to" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  How-To Guides
                </TabsTrigger>
                <TabsTrigger value="faq" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </TabsTrigger>
              </TabsList>

              {/* How-To Guides Tab */}
              <TabsContent value="how-to" className="mt-6">
                {searchQuery && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Showing {filteredHowToSections.reduce((acc, section) => acc + section.items.length, 0)} results for "{searchQuery}"
                    </p>
                  </div>
                )}

                {filteredHowToSections.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600">Try adjusting your search terms or browse our categories above.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {filteredHowToSections.map((section) => (
                      <div key={section.id} id={section.id}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-2 rounded-lg ${section.color} text-white`}>
                            {section.icon}
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                        </div>

                        <div className="grid gap-6">
                          {section.items.map((item, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <CardTitle className="text-xl">{item.title}</CardTitle>
                                <CardDescription className="text-base">{item.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4" />
                                    Step-by-step instructions:
                                  </h4>
                                  <ol className="space-y-2">
                                    {item.steps.map((step, stepIndex) => (
                                      <li key={stepIndex} className="flex items-start gap-3">
                                        <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                                          {stepIndex + 1}
                                        </Badge>
                                        <span className="text-gray-700">{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="mt-6">
                {searchQuery && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Showing {filteredFaqSections.reduce((acc, section) => acc + section.questions.length, 0)} results for "{searchQuery}"
                    </p>
                  </div>
                )}

                {filteredFaqSections.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600">Try adjusting your search terms or browse our FAQ categories above.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {filteredFaqSections.map((section, sectionIndex) => (
                      <div key={sectionIndex}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {section.icon}
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">{section.category}</h2>
                        </div>

                        <Accordion type="single" collapsible className="space-y-4">
                          {section.questions.map((faq, faqIndex) => (
                            <AccordionItem key={faqIndex} value={`${sectionIndex}-${faqIndex}`} className="border rounded-lg px-6">
                              <AccordionTrigger className="text-left hover:no-underline">
                                <span className="font-semibold text-gray-900">{faq.question}</span>
                              </AccordionTrigger>
                              <AccordionContent className="text-gray-700 leading-relaxed">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Our support team is ready to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <MessageSquare className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <ExternalLink className="w-5 h-5 mr-2" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
