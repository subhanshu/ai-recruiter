import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';

// Load environment variables
config();

// Sample data for seeding
const sampleJobs = [
  {
    id: randomUUID(),
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA (Remote)",
    responsibilities: `• Lead the development of user-facing features using React, TypeScript, and Next.js
• Collaborate with design team to implement pixel-perfect UI components
• Optimize application performance and ensure cross-browser compatibility
• Mentor junior developers and conduct code reviews
• Work closely with backend team to integrate APIs and services
• Implement responsive design principles and accessibility standards`,
    requiredSkills: `• 5+ years of experience with React, TypeScript, and modern JavaScript
• Strong proficiency in HTML5, CSS3, and responsive design
• Experience with state management libraries (Redux, Zustand, or Context API)
• Knowledge of testing frameworks (Jest, React Testing Library, Cypress)
• Experience with build tools (Webpack, Vite, or similar)
• Familiarity with version control (Git) and CI/CD pipelines`,
    qualifications: `• Bachelor's degree in Computer Science or related field
• Experience with modern frontend frameworks and libraries
• Strong problem-solving and debugging skills
• Excellent communication and collaboration abilities
• Portfolio demonstrating high-quality frontend work
• Experience with agile development methodologies`,
    jdRaw: `We are seeking a Senior Frontend Developer to join our growing engineering team. The ideal candidate will have extensive experience building modern web applications and a passion for creating exceptional user experiences.

Key Responsibilities:
• Lead the development of user-facing features using React, TypeScript, and Next.js
• Collaborate with design team to implement pixel-perfect UI components
• Optimize application performance and ensure cross-browser compatibility
• Mentor junior developers and conduct code reviews
• Work closely with backend team to integrate APIs and services
• Implement responsive design principles and accessibility standards

Required Skills:
• 5+ years of experience with React, TypeScript, and modern JavaScript
• Strong proficiency in HTML5, CSS3, and responsive design
• Experience with state management libraries (Redux, Zustand, or Context API)
• Knowledge of testing frameworks (Jest, React Testing Library, Cypress)
• Experience with build tools (Webpack, Vite, or similar)
• Familiarity with version control (Git) and CI/CD pipelines

Qualifications:
• Bachelor's degree in Computer Science or related field
• Experience with modern frontend frameworks and libraries
• Strong problem-solving and debugging skills
• Excellent communication and collaboration abilities
• Portfolio demonstrating high-quality frontend work
• Experience with agile development methodologies

We offer competitive salary, comprehensive benefits, and a flexible work environment.`
  },
  {
    id: randomUUID(),
    title: "Product Manager",
    department: "Product",
    location: "New York, NY (Hybrid)",
    responsibilities: `• Define product strategy and roadmap for our core platform
• Collaborate with engineering, design, and business teams to deliver features
• Conduct user research and analyze market trends to inform product decisions
• Create detailed product requirements and user stories
• Manage product backlog and prioritize features based on business value
• Track key metrics and KPIs to measure product success`,
    requiredSkills: `• 4+ years of product management experience in B2B SaaS
• Strong analytical and data-driven decision making skills
• Experience with user research methodologies and tools
• Proficiency in product management tools (Jira, Confluence, Figma)
• Excellent communication and presentation skills
• Experience working with cross-functional teams`,
    qualifications: `• Bachelor's degree in Business, Engineering, or related field
• Proven track record of launching successful products
• Experience in the recruitment or HR technology space preferred
• Strong understanding of agile development processes
• MBA or relevant certification is a plus
• Experience with AI/ML products is highly desirable`,
    jdRaw: `We're looking for an experienced Product Manager to drive the vision and execution of our AI-powered recruitment platform. You'll work closely with our engineering and design teams to build products that transform how companies hire talent.

Key Responsibilities:
• Define product strategy and roadmap for our core platform
• Collaborate with engineering, design, and business teams to deliver features
• Conduct user research and analyze market trends to inform product decisions
• Create detailed product requirements and user stories
• Manage product backlog and prioritize features based on business value
• Track key metrics and KPIs to measure product success

Required Skills:
• 4+ years of product management experience in B2B SaaS
• Strong analytical and data-driven decision making skills
• Experience with user research methodologies and tools
• Proficiency in product management tools (Jira, Confluence, Figma)
• Excellent communication and presentation skills
• Experience working with cross-functional teams

Qualifications:
• Bachelor's degree in Business, Engineering, or related field
• Proven track record of launching successful products
• Experience in the recruitment or HR technology space preferred
• Strong understanding of agile development processes
• MBA or relevant certification is a plus
• Experience with AI/ML products is highly desirable

Join us in revolutionizing the future of recruitment technology!`
  },
  {
    id: randomUUID(),
    title: "UX Designer",
    department: "Design",
    location: "Austin, TX (Remote)",
    responsibilities: `• Design intuitive and engaging user experiences for our recruitment platform
• Create wireframes, prototypes, and high-fidelity designs
• Conduct user research and usability testing sessions
• Collaborate with product managers and developers to implement designs
• Develop and maintain design systems and component libraries
• Present design concepts and rationale to stakeholders`,
    requiredSkills: `• 3+ years of UX/UI design experience
• Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)
• Experience with user research and usability testing
• Strong understanding of design principles and accessibility standards
• Experience designing for web and mobile applications
• Knowledge of HTML/CSS and frontend development concepts`,
    qualifications: `• Bachelor's degree in Design, Human-Computer Interaction, or related field
• Portfolio showcasing strong UX/UI design work
• Experience with B2B SaaS products preferred
• Strong communication and collaboration skills
• Experience working in agile development environments
• Understanding of recruitment or HR processes is a plus`,
    jdRaw: `We're seeking a talented UX Designer to join our design team and help create exceptional user experiences for our AI-powered recruitment platform. You'll work on everything from user research to pixel-perfect designs.

Key Responsibilities:
• Design intuitive and engaging user experiences for our recruitment platform
• Create wireframes, prototypes, and high-fidelity designs
• Conduct user research and usability testing sessions
• Collaborate with product managers and developers to implement designs
• Develop and maintain design systems and component libraries
• Present design concepts and rationale to stakeholders

Required Skills:
• 3+ years of UX/UI design experience
• Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)
• Experience with user research and usability testing
• Strong understanding of design principles and accessibility standards
• Experience designing for web and mobile applications
• Knowledge of HTML/CSS and frontend development concepts

Qualifications:
• Bachelor's degree in Design, Human-Computer Interaction, or related field
• Portfolio showcasing strong UX/UI design work
• Experience with B2B SaaS products preferred
• Strong communication and collaboration skills
• Experience working in agile development environments
• Understanding of recruitment or HR processes is a plus

Help us create beautiful, functional designs that make recruitment effortless!`
  },
  {
    id: randomUUID(),
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Seattle, WA (Hybrid)",
    responsibilities: `• Manage and maintain cloud infrastructure on AWS
• Implement CI/CD pipelines for automated deployments
• Monitor system performance and ensure high availability
• Automate infrastructure provisioning using Terraform
• Collaborate with development teams to improve deployment processes
• Implement security best practices and compliance requirements`,
    requiredSkills: `• 4+ years of DevOps or Site Reliability Engineering experience
• Strong experience with AWS services (EC2, S3, RDS, Lambda, etc.)
• Proficiency in infrastructure as code (Terraform, CloudFormation)
• Experience with containerization (Docker, Kubernetes)
• Knowledge of CI/CD tools (GitHub Actions, Jenkins, GitLab CI)
• Strong scripting skills (Bash, Python, or similar)`,
    qualifications: `• Bachelor's degree in Computer Science or related field
• AWS certifications preferred (Solutions Architect, DevOps Engineer)
• Experience with monitoring and logging tools (CloudWatch, DataDog, etc.)
• Strong problem-solving and troubleshooting skills
• Experience with database administration and optimization
• Knowledge of security best practices and compliance standards`,
    jdRaw: `We're looking for a skilled DevOps Engineer to help us scale our infrastructure and improve our deployment processes. You'll work with cutting-edge technologies and have a direct impact on our platform's reliability and performance.

Key Responsibilities:
• Manage and maintain cloud infrastructure on AWS
• Implement CI/CD pipelines for automated deployments
• Monitor system performance and ensure high availability
• Automate infrastructure provisioning using Terraform
• Collaborate with development teams to improve deployment processes
• Implement security best practices and compliance requirements

Required Skills:
• 4+ years of DevOps or Site Reliability Engineering experience
• Strong experience with AWS services (EC2, S3, RDS, Lambda, etc.)
• Proficiency in infrastructure as code (Terraform, CloudFormation)
• Experience with containerization (Docker, Kubernetes)
• Knowledge of CI/CD tools (GitHub Actions, Jenkins, GitLab CI)
• Strong scripting skills (Bash, Python, or similar)

Qualifications:
• Bachelor's degree in Computer Science or related field
• AWS certifications preferred (Solutions Architect, DevOps Engineer)
• Experience with monitoring and logging tools (CloudWatch, DataDog, etc.)
• Strong problem-solving and troubleshooting skills
• Experience with database administration and optimization
• Knowledge of security best practices and compliance standards

Join our team and help us build a robust, scalable platform!`
  }
];

const sampleQuestions = {
  "Senior Frontend Developer": [
    "Can you walk me through your experience with React and TypeScript? What are some of the most complex components you've built?",
    "How do you approach performance optimization in React applications? Can you share specific techniques you've used?",
    "Describe a time when you had to debug a difficult frontend issue. What was your process and how did you solve it?",
    "How do you ensure code quality and maintainability in large frontend codebases?",
    "What's your experience with testing frontend applications? How do you balance unit tests vs integration tests?",
    "How do you stay up-to-date with the latest frontend technologies and best practices?",
    "Can you explain the difference between client-side and server-side rendering? When would you choose each approach?",
    "Describe your experience working with design systems and component libraries."
  ],
  "Product Manager": [
    "How do you prioritize features when you have multiple stakeholders with different requirements?",
    "Can you walk me through your product discovery process? How do you identify user needs?",
    "Describe a time when you had to make a difficult product decision with limited data. How did you approach it?",
    "How do you measure the success of a product feature? What metrics do you track?",
    "Tell me about a product you launched that didn't meet expectations. What did you learn from it?",
    "How do you balance technical constraints with user needs when planning product features?",
    "Describe your experience working with engineering teams. How do you ensure clear communication?",
    "How do you handle competing priorities from different departments or stakeholders?"
  ],
  "UX Designer": [
    "Can you walk me through your design process from initial concept to final implementation?",
    "How do you conduct user research? What methods do you find most effective?",
    "Describe a time when you had to design for a complex user flow. How did you approach it?",
    "How do you ensure your designs are accessible to users with disabilities?",
    "Tell me about a design decision you made that was challenged. How did you defend it?",
    "How do you collaborate with developers to ensure your designs are implemented correctly?",
    "What's your approach to creating and maintaining design systems?",
    "How do you measure the success of your designs? What metrics do you use?"
  ],
  "DevOps Engineer": [
    "Can you describe your experience with AWS services? Which ones do you use most frequently?",
    "How do you approach disaster recovery and backup strategies for cloud infrastructure?",
    "Describe a time when you had to troubleshoot a production issue. What was your process?",
    "How do you ensure security in your infrastructure deployments?",
    "What's your experience with containerization and orchestration? How do you decide between different solutions?",
    "How do you monitor application performance and infrastructure health?",
    "Describe your experience with infrastructure as code. What tools do you prefer and why?",
    "How do you handle database migrations and zero-downtime deployments?"
  ]
};

const sampleCandidates = {
  "Senior Frontend Developer": [
    {
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "+1 (555) 123-4567",
      linkedinUrl: "https://linkedin.com/in/sarahchen-dev",
      resumeUrl: "https://example.com/resumes/sarah-chen.pdf"
    },
    {
      name: "Michael Rodriguez",
      email: "michael.rodriguez@email.com",
      phone: "+1 (555) 234-5678",
      linkedinUrl: "https://linkedin.com/in/michael-rodriguez-frontend",
      resumeUrl: "https://example.com/resumes/michael-rodriguez.pdf"
    },
    {
      name: "Emily Johnson",
      email: "emily.johnson@email.com",
      phone: "+1 (555) 345-6789",
      linkedinUrl: "https://linkedin.com/in/emily-johnson-react",
      resumeUrl: "https://example.com/resumes/emily-johnson.pdf"
    }
  ],
  "Product Manager": [
    {
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (555) 456-7890",
      linkedinUrl: "https://linkedin.com/in/david-kim-pm",
      resumeUrl: "https://example.com/resumes/david-kim.pdf"
    },
    {
      name: "Lisa Wang",
      email: "lisa.wang@email.com",
      phone: "+1 (555) 567-8901",
      linkedinUrl: "https://linkedin.com/in/lisa-wang-product",
      resumeUrl: "https://example.com/resumes/lisa-wang.pdf"
    }
  ],
  "UX Designer": [
    {
      name: "Alex Thompson",
      email: "alex.thompson@email.com",
      phone: "+1 (555) 678-9012",
      linkedinUrl: "https://linkedin.com/in/alex-thompson-ux",
      resumeUrl: "https://example.com/resumes/alex-thompson.pdf"
    },
    {
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "+1 (555) 789-0123",
      linkedinUrl: "https://linkedin.com/in/maria-garcia-design",
      resumeUrl: "https://example.com/resumes/maria-garcia.pdf"
    }
  ],
  "DevOps Engineer": [
    {
      name: "James Wilson",
      email: "james.wilson@email.com",
      phone: "+1 (555) 890-1234",
      linkedinUrl: "https://linkedin.com/in/james-wilson-devops",
      resumeUrl: "https://example.com/resumes/james-wilson.pdf"
    },
    {
      name: "Rachel Brown",
      email: "rachel.brown@email.com",
      phone: "+1 (555) 901-2345",
      linkedinUrl: "https://linkedin.com/in/rachel-brown-sre",
      resumeUrl: "https://example.com/resumes/rachel-brown.pdf"
    }
  ]
};

async function seedDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_API_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_API_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🌱 Starting database seeding...');

  try {
    // Create sample jobs
    console.log('📝 Creating sample jobs...');
    const { error: jobsError } = await supabase
      .from('Job')
      .insert(sampleJobs);

    if (jobsError) {
      console.error('Error creating jobs:', jobsError);
      return;
    }

    console.log(`✅ Created ${sampleJobs.length} jobs`);

    // Create questions for each job
    console.log('❓ Creating sample questions...');
    const questionsToInsert = [];
    
    for (const job of sampleJobs) {
      const jobQuestions = sampleQuestions[job.title as keyof typeof sampleQuestions] || [];
      for (let i = 0; i < jobQuestions.length; i++) {
        questionsToInsert.push({
          id: randomUUID(),
          text: jobQuestions[i],
          order: i + 1,
          jobId: job.id
        });
      }
    }

    const { error: questionsError } = await supabase
      .from('Question')
      .insert(questionsToInsert);

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      return;
    }

    console.log(`✅ Created ${questionsToInsert.length} questions`);

    // Create candidates for each job
    console.log('👥 Creating sample candidates...');
    const candidatesToInsert = [];
    
    for (const job of sampleJobs) {
      const jobCandidates = sampleCandidates[job.title as keyof typeof sampleCandidates] || [];
      for (const candidate of jobCandidates) {
        candidatesToInsert.push({
          id: randomUUID(),
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          linkedinUrl: candidate.linkedinUrl,
          resumeUrl: candidate.resumeUrl,
          jobId: job.id
        });
      }
    }

    const { error: candidatesError } = await supabase
      .from('Candidate')
      .insert(candidatesToInsert);

    if (candidatesError) {
      console.error('Error creating candidates:', candidatesError);
      return;
    }

    console.log(`✅ Created ${candidatesToInsert.length} candidates`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`• ${sampleJobs.length} jobs created`);
    console.log(`• ${questionsToInsert.length} questions created`);
    console.log(`• ${candidatesToInsert.length} candidates created`);

  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

// Run the seeding function
seedDatabase();
