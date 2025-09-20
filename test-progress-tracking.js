#!/usr/bin/env node

/**
 * Test script to verify improved progress tracking during bulk upload
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testProgressTracking() {
  console.log('📊 Testing Improved Progress Tracking...\n');

  try {
    // Step 1: Get job ID
    const jobsResponse = await fetch(`${API_BASE_URL}/api/jobs`);
    const jobsResult = await jobsResponse.json();
    const jobId = jobsResult[0]?.id;

    if (!jobId) {
      console.log('❌ No job ID found');
      return;
    }
    console.log(`✅ Using Job ID: ${jobId}`);

    // Step 2: Prepare test files
    const testFiles = ['Resume1_Junior.pdf', 'Resume2_MidLevel.pdf', 'Resume3_Senior.pdf'];
    const existingFiles = testFiles.filter(filename => 
      fs.existsSync(path.join('./test resumes', filename))
    );

    if (existingFiles.length === 0) {
      console.log('❌ No test files found in ./test resumes/');
      return;
    }

    console.log(`📁 Testing with ${existingFiles.length} files: ${existingFiles.join(', ')}`);

    // Step 3: Start upload
    const sessionId = require('crypto').randomUUID();
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('sessionId', sessionId);

    existingFiles.forEach(filename => {
      const filePath = path.join('./test resumes', filename);
      const fileStream = fs.createReadStream(filePath);
      formData.append('files', fileStream, filename);
    });

    console.log(`\n🚀 Starting upload with session: ${sessionId}`);
    console.log('📊 Monitoring progress in real-time...\n');

    // Start upload in background
    const uploadStartTime = Date.now();
    const uploadPromise = fetch(`${API_BASE_URL}/api/candidates/bulk/upload`, {
      method: 'POST',
      body: formData
    });

    // Monitor progress
    let lastProgress = -1;
    let progressUpdates = [];
    
    const monitorProgress = async () => {
      while (true) {
        try {
          const progressResponse = await fetch(`${API_BASE_URL}/api/candidates/bulk/status?sessionId=${sessionId}`);
          
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            const currentProgress = Math.round((progressData.processedFiles / progressData.totalFiles) * 100);
            
            // Only log when progress changes
            if (currentProgress !== lastProgress || progressData.currentFile) {
              const timestamp = new Date().toLocaleTimeString();
              const status = progressData.currentFile || `${progressData.processedFiles}/${progressData.totalFiles} files`;
              
              console.log(`[${timestamp}] 📈 ${currentProgress}% - ${status}`);
              
              progressUpdates.push({
                timestamp: Date.now() - uploadStartTime,
                progress: currentProgress,
                status: progressData.currentFile,
                processedFiles: progressData.processedFiles
              });
              
              lastProgress = currentProgress;
            }
            
            // Check if completed
            if (progressData.status === 'completed' || progressData.status === 'failed') {
              console.log(`\n🏁 Upload ${progressData.status}!`);
              break;
            }
          } else if (progressResponse.status === 404) {
            // Session not found yet, continue polling
          } else {
            console.log(`❌ Progress fetch error: ${progressResponse.status}`);
          }
        } catch (err) {
          console.log(`❌ Progress monitoring error: ${err.message}`);
        }
        
        // Wait 300ms before next poll
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    };

    // Start monitoring
    const monitorPromise = monitorProgress();
    
    // Wait for both to complete
    const [uploadResult] = await Promise.all([uploadPromise, monitorPromise]);
    const totalTime = Date.now() - uploadStartTime;

    // Get final result
    const finalResult = await uploadResult.json();

    console.log('\n🎯 PROGRESS TRACKING ANALYSIS:');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`📊 Progress Updates: ${progressUpdates.length}`);
    console.log(`✅ Successful: ${finalResult.data?.summary?.successful || 0}`);
    console.log(`❌ Failed: ${finalResult.data?.summary?.failed || 0}`);

    if (progressUpdates.length > 0) {
      console.log('\n📈 PROGRESS TIMELINE:');
      progressUpdates.forEach((update, index) => {
        const timeFromStart = (update.timestamp / 1000).toFixed(1);
        console.log(`   ${index + 1}. [+${timeFromStart}s] ${update.progress}% - ${update.status || 'Processing...'}`);
      });
      
      const avgTimeBetweenUpdates = totalTime / progressUpdates.length;
      console.log(`\n📊 Average time between updates: ${avgTimeBetweenUpdates.toFixed(0)}ms`);
      
      if (progressUpdates.length >= existingFiles.length * 2) {
        console.log('✅ EXCELLENT: Detailed progress tracking with multiple updates per file');
      } else if (progressUpdates.length >= existingFiles.length) {
        console.log('✅ GOOD: Progress tracking shows updates for each file');
      } else {
        console.log('⚠️  NEEDS IMPROVEMENT: Limited progress updates');
      }
    }

    // Test final status
    console.log('\n🔍 Final Status Check:');
    const finalStatusResponse = await fetch(`${API_BASE_URL}/api/candidates/bulk/status?sessionId=${sessionId}`);
    if (finalStatusResponse.ok) {
      const finalStatus = await finalStatusResponse.json();
      console.log(`   Status: ${finalStatus.status}`);
      console.log(`   Results: ${finalStatus.results?.length || 0} candidates processed`);
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Run the test
testProgressTracking().catch(console.error);
