# Sentry Integration Setup

This project has been configured with Sentry for error logging, performance monitoring, and session replay.

## Configuration Files

- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration  
- `sentry.edge.config.ts` - Edge runtime Sentry configuration
- `instrumentation.ts` - Next.js instrumentation hook
- `.sentryclirc` - Sentry CLI configuration

## Features Enabled

### Error Logging
- Automatic error capture for unhandled exceptions
- Custom error boundaries for React components
- Server-side error logging for API routes

### Performance Monitoring
- Transaction tracing for page loads and API calls
- Custom performance measurements
- Database query monitoring

### Session Replay
- 10% of all sessions are recorded
- 100% of sessions with errors are recorded
- User feedback integration

### Logging
- Console logs are sent to Sentry
- Structured logging support

## Testing the Integration

1. Visit `/test-sentry` to test various Sentry features
2. Check your Sentry dashboard at https://sentry.io
3. Look for test data in Issues, Performance, or Replays sections

## Environment Variables

Make sure to set the following environment variables in production:

```bash
SENTRY_DSN=https://ccd8c1681e5479efe988b1740fde06f7@o4509470669733888.ingest.us.sentry.io/4509980125691904
SENTRY_ORG=subhanshu
SENTRY_PROJECT=ai-recruiter
SENTRY_AUTH_TOKEN=your_auth_token_here
```

## Manual Error Reporting

You can manually capture errors, messages, and breadcrumbs:

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture an exception
Sentry.captureException(error);

// Capture a message
Sentry.captureMessage('Something happened', 'info');

// Add breadcrumbs
Sentry.addBreadcrumb({
  message: 'User action',
  level: 'info',
  category: 'user-action',
});

// Start a transaction
const transaction = Sentry.startTransaction({
  name: 'Custom Operation',
  op: 'custom',
});
// ... do work ...
transaction.finish();
```

## Production Considerations

1. **Sample Rates**: Adjust `tracesSampleRate` and `replaysSessionSampleRate` for production
2. **Source Maps**: Ensure source maps are uploaded for better error tracking
3. **Privacy**: Review `sendDefaultPii` setting based on your privacy requirements
4. **Rate Limiting**: Monitor your Sentry quota and adjust sample rates accordingly

## Troubleshooting

- Check the browser console for Sentry initialization messages
- Verify your DSN is correct
- Ensure the Sentry project exists and is accessible
- Check network requests to Sentry endpoints in browser dev tools
