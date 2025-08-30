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
# Database - Use the connection string from Supabase dashboard
DATABASE_URL="postgresql://postgres.eigvloqjirrvnmbrdftd:6SegBqjdjbW8sZB3@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://eigvloqjirrvnmbrdftd.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZ3Zsb3FqaXJydm5tYnJkZnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODI5NDAsImV4cCI6MjA3MjE1ODk0MH0.zEOC0D49j0IP8mW0QlmnaK0u-a1lToXgmWNmqLfbksA"
SUPABASE_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZmJmeW1kb292a3dvZGF2bXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjE2MjQsImV4cCI6MjA2OTM5NzYyNH0.52p3kd1xP2pbpDN0TL0qI1xQ8cdmusxiCPo40rxTMCk"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Node Environment
NODE_ENV="production"
```

### 3. Database Setup

Before deploying, you need to create the database tables:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/eigvloqjirrvnmbrdftd)
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
