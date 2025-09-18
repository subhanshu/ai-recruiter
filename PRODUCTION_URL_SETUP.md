# Production URL Configuration

This guide explains how to properly configure the application URL for production deployments to fix the localhost URL issue.

## Problem

The application was generating interview URLs with `localhost:3000` in production because the `NEXT_PUBLIC_APP_URL` environment variable was not set.

## Solution

### 1. Environment Variable Setup

Set the `NEXT_PUBLIC_APP_URL` environment variable in your production environment:

```bash
NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
```

### 2. Platform-Specific Configuration

#### Railway (Primary Platform)
1. Go to your Railway project dashboard
2. Click on your service
3. Go to Variables tab
4. Add a new variable:
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: `https://your-app-name.railway.app` (or your custom domain)

#### Other Platforms
Set the environment variable in your platform's configuration:
- **Netlify**: Site settings → Environment variables
- **Heroku**: Settings → Config vars
- **DigitalOcean App Platform**: Settings → Environment variables

### 3. Automatic URL Detection

The application now includes automatic URL detection that works with:

- **Railway**: Uses `RAILWAY_PUBLIC_DOMAIN` environment variable (primary)
- **Railway Custom Domains**: Uses `RAILWAY_STATIC_URL` environment variable
- **Custom domains**: Set `NEXT_PUBLIC_APP_URL` explicitly

### 4. Verification

After deploying with the environment variable set:

1. Generate an interview link
2. Check that the URL uses your production domain instead of localhost
3. Test that the interview link works correctly

### 5. Development vs Production

- **Development**: Uses `http://localhost:3000` (automatic)
- **Production**: Uses the configured `NEXT_PUBLIC_APP_URL` or platform-specific variables

## Files Modified

- `lib/url-utils.ts` - New utility for URL generation
- `app/api/interview-links/route.ts` - Updated to use URL utility
- `app/api/outreach/route.ts` - Updated to use URL utility
- `app/api/candidates/bulk/upload/route.ts` - Updated to use URL utility
- `.env.example` - Added `NEXT_PUBLIC_APP_URL` documentation

## Testing

To test locally with a custom URL:

```bash
# In your .env.local file
NEXT_PUBLIC_APP_URL=https://your-test-domain.com
```

This will override the localhost URL for testing purposes.
