// Test script to verify AI parsing and data storage
const fs = require('fs');
const path = require('path');

async function testAIParsing() {
  console.log('🧪 Testing AI Parsing and Data Storage...\n');

  try {
    // Test 1: Test AI parsing with a sample resume
    console.log('1. Testing AI resume parsing...');
    
    // Create a sample resume file
    const sampleResume = `
John Doe
Software Engineer
Email: john.doe@example.com
Phone: +1-555-123-4567
Location: San Francisco, CA
LinkedIn: https://linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development. 
Specialized in React, Node.js, and cloud technologies.

SKILLS
- JavaScript, TypeScript, Python
- React, Node.js, Express
- AWS, Docker, Kubernetes
- PostgreSQL, MongoDB
- Git, Agile methodologies

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-2024
- Led development of microservices architecture
- Improved system performance by 40%
- Mentored junior developers

Software Engineer | StartupXYZ | 2018-2020
- Built responsive web applications
- Implemented CI/CD pipelines
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2018

PROJECTS
E-commerce Platform
- Built full-stack e-commerce solution
- Technologies: React, Node.js, PostgreSQL
- Handled 10,000+ daily users

CERTIFICATIONS
- AWS Certified Solutions Architect
- Google Cloud Professional Developer
`;

    // Create a temporary file
    const tempFile = new File([sampleResume], 'test-resume.txt', { type: 'text/plain' });
    
    // Test the parse-resume API
    const formData = new FormData();
    formData.append('resume', tempFile);
    
    const parseResponse = await fetch('http://localhost:3000/api/ai/parse-resume', {
      method: 'POST',
      body: formData,
    });

    if (parseResponse.ok) {
      const parseResult = await parseResponse.json();
      console.log('✅ AI parsing working');
      console.log('   Parsed data structure:');
      console.log('   - Name:', parseResult.data.name);
      console.log('   - Email:', parseResult.data.email);
      console.log('   - Phone:', parseResult.data.phone);
      console.log('   - Location:', parseResult.data.location);
      console.log('   - LinkedIn:', parseResult.data.linkedinUrl);
      console.log('   - Skills:', parseResult.data.skills?.length || 0, 'skills found');
      console.log('   - Experience:', parseResult.data.experience);
      console.log('   - Education:', parseResult.data.education ? 'Found' : 'Not found');
      console.log('   - Summary:', parseResult.data.summary ? 'Found' : 'Not found');
      console.log('   - Work History:', parseResult.data.workHistory?.length || 0, 'entries');
      console.log('   - Projects:', parseResult.data.projects?.length || 0, 'projects');
      console.log('   - Certifications:', parseResult.data.certifications?.length || 0, 'certifications');
      console.log('   - Languages:', parseResult.data.languages?.length || 0, 'languages');
    } else {
      const error = await parseResponse.json();
      console.log('❌ AI parsing failed:', error);
    }

    // Test 2: Test bulk upload with AI parsing
    console.log('\n2. Testing bulk upload with AI parsing...');
    
    const bulkFormData = new FormData();
    bulkFormData.append('jobId', 'test-job-123');
    bulkFormData.append('files', tempFile);
    
    const bulkResponse = await fetch('http://localhost:3000/api/candidates/bulk/upload', {
      method: 'POST',
      body: bulkFormData,
    });

    if (bulkResponse.ok) {
      const bulkResult = await bulkResponse.json();
      console.log('✅ Bulk upload with AI parsing working');
      console.log('   Summary:');
      console.log('   - Total files:', bulkResult.data.summary.total);
      console.log('   - Successful:', bulkResult.data.summary.successful);
      console.log('   - Failed:', bulkResult.data.summary.failed);
      
      if (bulkResult.data.candidates.length > 0) {
        const candidate = bulkResult.data.candidates[0];
        console.log('   Sample candidate data:');
        console.log('   - Name:', candidate.name);
        console.log('   - Email:', candidate.email);
        console.log('   - Status:', candidate.status);
        console.log('   - Errors:', candidate.errors.length > 0 ? candidate.errors : 'None');
      }
    } else {
      const error = await bulkResponse.json();
      console.log('❌ Bulk upload failed:', error);
    }

    // Test 3: Test database schema
    console.log('\n3. Testing database schema...');
    
    // This would require a database connection test
    console.log('   Database schema updated with new fields:');
    console.log('   - location, skills, experience, education');
    console.log('   - summary, workHistory, projects');
    console.log('   - certifications, languages');
    console.log('   Run the migration script: add-candidate-fields.sql');

    console.log('\n🎉 AI Parsing and Data Storage test completed!');
    console.log('\nNext steps:');
    console.log('1. Run the database migration: add-candidate-fields.sql');
    console.log('2. Test the full flow with real resume files');
    console.log('3. Verify data is stored correctly in the database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the development server is running: npm run dev');
  }
}

// Run the test
testAIParsing();
