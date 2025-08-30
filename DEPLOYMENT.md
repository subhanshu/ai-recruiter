# 🚀 Railway Deployment Guide

## Current Status

✅ **App Build**: Working correctly  
✅ **Health Check**: `/api/health` endpoint created  
✅ **Railway Config**: `railway.toml` configured  
⚠️ **Database**: Connection needs verification  

## Prerequisites

1. **Railway Account**: [railway.app](https://railway.app)
2. **GitHub Repository**: Code pushed to GitHub
3. **Supabase Project**: Active project with database access
4. **OpenAI API Key**: For AI features

## Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Deploy on Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `ai-recruiter` repository
4. Wait for automatic build and deployment

### 3. Set Environment Variables
In Railway project → Variables tab:

```bash
# Database - Get exact string from Supabase dashboard
DATABASE_URL="postgresql://postgres.eigvloqjirrvnmbrdftd:6SegBqjdjbW8sZB3@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://eigvloqjirrvnmbrdftd.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZ3Zsb3FqaXJydm5tYnJkZnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODI5NDAsImV4cCI6MjA3MjE1ODk0MH0.zEOC0D49j0IP8mW0QlmnaK0u-a1lToXgmWNmqLfbksA"
SUPABASE_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZmJmeW1kb292a3dvZGF2bXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjE2MjQsImV4cCI6MjA2OTM5NzYyNH0.52p3kd1xP2pbpDN0TL0qI1xQ8cdmusxiCPo40rxTMCk"

# OpenAI
OPENAI_API_KEY="sk-..."

# Environment
NODE_ENV="production"
```

## Database Setup (Required Before Deployment)

### Step 1: Create Tables in Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/eigvloqjirrvnmbrdftd)
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `schema.sql`
4. Click **Run** to execute

### Step 2: Verify Tables Created
Check that these tables exist:
- `User`
- `Job` 
- `Question`
- `Candidate`
- `Interview`
- `OutreachLink`

## Railway Configuration

### Build Process
Railway automatically runs:
```bash
npm install
npm run prisma:generate  # Generates Prisma client
npm run build            # Builds Next.js app
npm start               # Starts production server
```

### Health Check
- **Endpoint**: `/api/health`
- **Checks**: Database connection, app status
- **Timeout**: 300 seconds
- **Auto-restart**: On failure

### Environment
- **Node Version**: 18+ (auto-detected)
- **Build Tool**: Nixpacks
- **Port**: Auto-assigned by Railway

## Testing Deployment

### 1. Health Check
Visit: `https://your-app.railway.app/api/health`
Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-08-31T...",
  "environment": "production"
}
```

### 2. Main App
Visit: `https://your-app.railway.app/`
Should show the AI Interview demo page

### 3. Dashboard
Visit: `https://your-app.railway.app/dashboard`
Should show jobs dashboard (empty initially)

## Troubleshooting

### Build Failures
```bash
# Check Railway build logs
# Common issues:
- Missing dependencies in package.json
- Prisma generation failing
- TypeScript compilation errors
```

### Runtime Errors
```bash
# Check Railway runtime logs
# Common issues:
- Missing environment variables
- Database connection failing
- Port conflicts
```

### Database Connection Issues
1. **Verify Supabase Status**: Project must be active
2. **Check Connection String**: Use exact format from dashboard
3. **Test Tables Exist**: Run schema.sql in Supabase
4. **Check Firewall**: Some networks block DB connections

### Health Check Failing
- Database not accessible
- Environment variables missing
- App not starting properly

## Monitoring & Scaling

### Railway Features
- **Real-time Logs**: View app and build logs
- **Metrics**: CPU, memory, network usage
- **Auto-scaling**: Based on traffic
- **Rollbacks**: Easy deployment rollback

### Health Monitoring
- **Automatic**: Railway monitors `/api/health`
- **Manual**: Check logs and metrics
- **Alerts**: Set up notifications for failures

## Post-Deployment

### 1. Test All Features
- ✅ AI Interview demo
- ✅ Job creation
- ✅ Dashboard access
- ✅ API endpoints

### 2. Set Up Monitoring
- Monitor Railway dashboard
- Set up alerts if needed
- Track performance metrics

### 3. Custom Domain (Optional)
1. Railway project → Settings → Custom Domains
2. Add your domain
3. Update DNS records

## Cost Optimization

### Railway Pricing
- **Free Tier**: Limited usage
- **Pay-as-you-go**: Based on actual usage
- **Pause Projects**: When not in use

### Tips
- Monitor resource usage
- Set reasonable limits
- Pause during development
- Use auto-scaling wisely

## Support

### Railway Support
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway GitHub](https://github.com/railwayapp)

### Project Issues
- Check Railway logs first
- Verify environment variables
- Test database connection
- Review build process

---

## 🎯 Next Steps After Deployment

1. **Test Database Operations**: Create a test job
2. **Verify AI Features**: Test OpenAI integration
3. **Monitor Performance**: Check Railway metrics
4. **Set Up Alerts**: Configure failure notifications
5. **Scale as Needed**: Adjust resources based on usage
