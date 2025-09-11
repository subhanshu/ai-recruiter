# Bulk Upload Feature Documentation

## Overview

The bulk upload feature allows users to upload multiple candidate resumes (PDF, Word documents) and automatically parse them using AI to extract candidate information. This feature includes real-time progress monitoring and background processing.

## Features

### ✅ Implemented Features

1. **Bulk Resume Upload**
   - Support for PDF, DOC, DOCX, and TXT files
   - File size validation (max 10MB per file)
   - Multiple file selection and upload

2. **AI-Powered Resume Parsing**
   - Automatic extraction of candidate information
   - Name, email, phone, LinkedIn URL extraction
   - Skills, experience, and education parsing
   - Professional summary generation

3. **Real-time Progress Monitoring**
   - Live progress updates during processing
   - Success/failure counts
   - Error reporting and details
   - Server-Sent Events (SSE) for real-time updates

4. **Background Processing**
   - Non-blocking file processing
   - Queue-based job management
   - Automatic retry on failures
   - Progress persistence

5. **User Interface**
   - Intuitive drag-and-drop interface
   - Progress bars and status indicators
   - Error handling and user feedback
   - Integration with existing job management

## API Endpoints

### 1. Bulk Upload API
```
POST /api/candidates/bulk
```
Handles bulk candidate creation with background processing.

**Request Body:**
```json
{
  "jobId": "string",
  "candidates": [
    {
      "name": "string",
      "email": "string",
      "phone": "string",
      "linkedinUrl": "string",
      "status": "valid|invalid",
      "errors": ["string"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "string",
  "message": "Bulk upload started"
}
```

### 2. File Upload API
```
POST /api/candidates/bulk/upload
```
Handles direct file uploads with AI parsing.

**Request:** FormData with `jobId` and `files[]`

**Response:**
```json
{
  "success": true,
  "data": {
    "candidates": [...],
    "summary": {
      "total": 5,
      "successful": 4,
      "failed": 1
    }
  }
}
```

### 3. Status Monitoring API
```
GET /api/candidates/bulk/status?jobId=string
```
Provides real-time progress updates via Server-Sent Events.

**Response:** SSE stream with job status updates

## Components

### 1. BulkUploadProgress Component
Real-time progress monitoring component with:
- Progress bar
- Success/failure statistics
- Error reporting
- Completion status

### 2. useBulkUpload Hook
React hook for managing bulk upload state:
- Upload initiation
- Progress tracking
- Error handling
- Job management

### 3. Enhanced Bulk Upload Page
Updated bulk upload page with:
- File selection interface
- Progress monitoring
- Error handling
- Integration with job management

## Usage

### 1. From Job Detail Page
1. Navigate to a job detail page
2. Click the "Bulk Upload" button in the candidates tab
3. Select multiple resume files
4. Watch real-time progress
5. Review results and errors

### 2. Direct Access
1. Navigate to `/candidates/bulk?jobId=YOUR_JOB_ID`
2. Select upload method (CSV or Resume files)
3. Upload files or paste CSV data
4. Monitor progress in real-time

## File Support

### Supported File Types
- **PDF**: `.pdf` (application/pdf)
- **Word Documents**: `.doc`, `.docx` (application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- **Text Files**: `.txt` (text/plain)

### File Size Limits
- Maximum file size: 10MB per file
- No limit on number of files (within reasonable bounds)

## Error Handling

### File-Level Errors
- Invalid file type
- File too large
- Corrupted file
- Parsing errors

### System-Level Errors
- Database connection issues
- AI service failures
- Network timeouts
- Authentication errors

### User Feedback
- Real-time error reporting
- Detailed error messages
- Retry suggestions
- Progress indicators

## Performance Considerations

### Background Processing
- Files are processed asynchronously
- Progress updates every second
- Non-blocking UI operations
- Automatic cleanup on completion

### Rate Limiting
- 1-second delay between file processing
- 500ms delay between candidate creation
- Prevents system overload

### Memory Management
- Files are processed one at a time
- Temporary data cleanup
- Efficient error handling

## Security

### File Validation
- MIME type checking
- File extension validation
- Size limits enforced
- Malicious file detection

### Data Protection
- Secure file storage
- Encrypted data transmission
- User authentication required
- Audit logging

## Testing

### Manual Testing
1. Run the test script: `node test-bulk-upload.js`
2. Test with various file types
3. Test error scenarios
4. Verify progress monitoring

### Test Scenarios
- Valid file uploads
- Invalid file types
- Large files
- Network interruptions
- Database errors

## Future Enhancements

### Planned Features
1. **Batch Processing**: Process multiple jobs simultaneously
2. **Resume Templates**: Support for different resume formats
3. **Duplicate Detection**: Identify duplicate candidates
4. **Advanced Parsing**: Extract more detailed information
5. **Export Results**: Download processing results

### Performance Improvements
1. **Parallel Processing**: Process multiple files simultaneously
2. **Caching**: Cache parsed results
3. **Queue Management**: Redis-based job queue
4. **CDN Integration**: Faster file uploads

## Troubleshooting

### Common Issues

1. **Files not uploading**
   - Check file type and size
   - Verify network connection
   - Check browser console for errors

2. **Progress not updating**
   - Refresh the page
   - Check SSE connection
   - Verify job ID

3. **Parsing errors**
   - Ensure files contain readable text
   - Check file format
   - Try with different files

### Debug Mode
Enable debug logging by setting `DEBUG=true` in environment variables.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages
3. Check browser console
4. Contact development team

---

**Last Updated:** December 2024
**Version:** 1.0.0
