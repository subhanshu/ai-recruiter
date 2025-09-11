// Test script for bulk upload functionality
const fs = require('fs');
const path = require('path');

async function testBulkUpload() {
  console.log('🧪 Testing Bulk Upload Functionality...\n');

  try {
    // Test 1: Check if bulk upload API endpoint exists
    console.log('1. Testing bulk upload API endpoint...');
    const response = await fetch('http://localhost:3000/api/candidates/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: 'test-job-id',
        candidates: [
          {
            name: 'Test Candidate 1',
            email: 'test1@example.com',
            phone: '+1234567890',
            status: 'valid',
            errors: []
          },
          {
            name: 'Test Candidate 2',
            email: 'test2@example.com',
            phone: '+1234567891',
            status: 'valid',
            errors: []
          }
        ]
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Bulk upload API endpoint working');
      console.log(`   Job ID: ${result.jobId}`);
    } else {
      const error = await response.json();
      console.log('❌ Bulk upload API endpoint failed:', error);
    }

    // Test 2: Check if file upload endpoint exists
    console.log('\n2. Testing file upload endpoint...');
    const formData = new FormData();
    formData.append('jobId', 'test-job-id');
    
    // Create a test file
    const testFile = new File(['Test resume content'], 'test-resume.txt', { type: 'text/plain' });
    formData.append('files', testFile);

    const uploadResponse = await fetch('http://localhost:3000/api/candidates/bulk/upload', {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ File upload endpoint working');
      console.log(`   Processed ${uploadResult.data.summary.total} files`);
      console.log(`   Successful: ${uploadResult.data.summary.successful}`);
      console.log(`   Failed: ${uploadResult.data.summary.failed}`);
    } else {
      const error = await uploadResponse.json();
      console.log('❌ File upload endpoint failed:', error);
    }

    // Test 3: Check if status endpoint exists
    console.log('\n3. Testing status endpoint...');
    const statusResponse = await fetch('http://localhost:3000/api/candidates/bulk/status?jobId=test-job-id');
    
    if (statusResponse.ok) {
      console.log('✅ Status endpoint working');
    } else {
      console.log('❌ Status endpoint failed');
    }

    console.log('\n🎉 Bulk upload functionality test completed!');
    console.log('\nTo test the full flow:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Navigate to a job detail page');
    console.log('3. Click "Bulk Upload" button');
    console.log('4. Upload multiple resume files');
    console.log('5. Watch the progress in real-time');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the development server is running: npm run dev');
  }
}

// Run the test
testBulkUpload();
