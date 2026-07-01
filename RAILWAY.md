# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Supabase Project**: Ensure your project is active

## Deployment Steps

### 1. Connect to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `ai-recruiter` repository

### 2. Set Environment Variables

In your Railway project, go to the "Variables" tab and set these environment variables:

```bash
# Database - Use the connection string from your Supabase dashboard
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<region>.pooler.supabase.com:5432/postgres"

# Supabase - values from your live project (Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="<your-anon-publishable-key>"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Node Environment
NODE_ENV="production"
```

> **Build-time note:** `NEXT_PUBLIC_*` variables are inlined into the bundle at
> **build time** by `next build`. Set them as Railway **service** variables
> (available during build) and trigger a fresh build/redeploy after changing
> them — updating them only at runtime has no effect. The key variable the code
> reads is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
> (`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted as a fallback).

### 3. Database Setup

Before deploying, you need to create the database tables:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open your project
2. Navigate to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the SQL to create all tables

### 4. Deploy

Railway will automatically:
- Install dependencies (`npm install`)
- Generate Prisma client (`npm run prisma:generate`)
- Build the application (`npm run build`)
- Start the application (`npm start`)

### 5. Custom Domain (Optional)

1. Go to your Railway project settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. **Check Supabase Status**: Ensure your project is active
2. **Verify Connection String**: Use the exact string from Supabase dashboard
3. **Test Locally**: Run `npm run dev` to test locally first
4. **Check Firewall**: Some networks block database connections

### Build Issues

If the build fails:

1. **Check Logs**: View Railway build logs
2. **Verify Dependencies**: Ensure all packages are in `package.json`
3. **Node Version**: Railway uses Node 18+ by default

### Runtime Issues

If the app crashes:

1. **Check Logs**: View Railway runtime logs
2. **Environment Variables**: Ensure all required vars are set
3. **Database Tables**: Verify tables exist in Supabase

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Alerts**: Automatic notifications for issues
- **Rollbacks**: Easy rollback to previous deployments

## Scaling

Railway automatically scales based on traffic:
- **Horizontal Scaling**: Multiple instances
- **Vertical Scaling**: More CPU/memory as needed
- **Auto-scaling**: Based on demand

## Cost Optimization

- **Pause Projects**: Pause when not in use
- **Resource Limits**: Set reasonable limits
- **Monitoring**: Keep track of usage
