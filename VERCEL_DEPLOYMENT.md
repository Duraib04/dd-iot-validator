# DD IoT Validator - Vercel Deployment Guide

## 🚀 Vercel Deployment Options

Vercel can host both frontend and backend, but with different approaches:

### Option 1: Frontend on Vercel + Backend on Heroku (Recommended)
- ✅ Best performance
- ✅ Easy frontend deployment
- ✅ Supports persistent Node.js backend
- ✅ Free tier available for both

### Option 2: Full-Stack on Vercel (Serverless)
- ✅ Single platform
- ⚠️ Backend converted to API routes
- ⚠️ Cold start issues possible
- ⚠️ Better for stateless operations

### Option 3: Frontend on Vercel + Backend on Azure
- ✅ Enterprise-grade
- ✅ Scalability
- ❌ More expensive

---

## 📋 Prerequisites (for Option 1 - Recommended)

### Tools Needed
```bash
# Install Vercel CLI
npm i -g vercel

# Git configured
git --version
```

### Accounts Needed
- GitHub account (for pushing code)
- Vercel account (vercel.com - free)
- Heroku account (for backend) or Azure

### Keys & URLs
- Supabase URL and Key
- OpenAI API Key

---

## 🎯 OPTION 1: Frontend on Vercel + Backend on Heroku

### Step 1: Prepare Frontend

```bash
# Navigate to frontend
cd frontend

# Ensure build works locally
npm run build
npm run preview

# Should see no errors
```

### Step 2: Create Vercel Project

#### Method A: Using Vercel CLI (Fastest)

```bash
# From frontend directory
vercel login
vercel
# Follow prompts:
# - Set project name: dd-iot-validator
# - Select framework: Vite
# - Build command: npm run build
# - Output directory: dist
# - Configure environment: Yes
```

#### Method B: Using GitHub (Recommended)

1. **Push frontend to GitHub**
```bash
cd frontend
git init
git add .
git commit -m "Initial frontend"
git remote add origin https://github.com/YOUR_USERNAME/dd-iot-validator.git
git branch -M main
git push -u origin main
```

2. **Go to vercel.com**
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select your repository
   - Fill in settings:
     - Framework: Vite
     - Root Directory: frontend
     - Build: `npm run build`
     - Output: dist

3. **Add Environment Variables**
   - Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-heroku-app.herokuapp.com`

### Step 3: Deploy Backend to Heroku

1. **Create Heroku Account** (heroku.com)

2. **Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows (via npm)
npm i -g heroku
```

3. **Login to Heroku**
```bash
heroku login
# Opens browser to authenticate
```

4. **Create Heroku App**
```bash
cd backend
heroku create dd-iot-validator-api
```

5. **Set Environment Variables**
```bash
heroku config:set OPENAI_API_KEY=sk-your-key
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_KEY=your-anon-key
heroku config:set CORS_ORIGIN=https://YOUR_VERCEL_DOMAIN.vercel.app
heroku config:set NODE_ENV=production
```

6. **Create Procfile** (in backend directory)
```bash
echo "web: npm run start" > Procfile
```

7. **Deploy to Heroku**
```bash
git init
git add .
git commit -m "Initial backend"
heroku git:remote -a dd-iot-validator-api
git push heroku main
```

8. **View Logs**
```bash
heroku logs --tail
```

### Step 4: Update Frontend API URL

```bash
# In vercel.com dashboard:
# Project Settings → Environment Variables
# VITE_API_URL=https://dd-iot-validator-api.herokuapp.com
```

### Step 5: Test Deployment

```bash
# Frontend (automatic)
# https://YOUR_PROJECT.vercel.app

# Backend health check
curl https://dd-iot-validator-api.herokuapp.com/health
# Should return: { status: "ok", ... }
```

---

## 📱 OPTION 2: Full-Stack on Vercel (If You Want Single Platform)

### Limitations
- No persistent background processes
- Functions timeout after 60 seconds
- Not ideal for long-running interviews

### If You Still Want This:

1. **Convert Backend to Vercel Functions**
```bash
# Create vercel.json in backend root
```

2. **Install dependencies**
```bash
npm install --save-dev vercel
```

3. **Deploy**
```bash
cd backend
vercel
```

### Note: Not recommended for this project due to timeout constraints

---

## 🌐 OPTION 3: Complete Vercel Setup (Recommended Alternative)

### Use Vercel for Frontend + Your Own Server for Backend

If you don't want Heroku costs, deploy backend to:
- ✅ Azure Container Apps (free tier)
- ✅ Railway.app (generous free tier)
- ✅ Render.com (free tier)
- ✅ Fly.io (free tier)

---

## ✅ Deployment Checklist (Option 1)

### Frontend (Vercel)
- [ ] Frontend builds locally (`npm run build`)
- [ ] GitHub repo created and pushed
- [ ] Vercel project connected
- [ ] Environment variables set
- [ ] Custom domain added (optional)
- [ ] HTTPS enabled (automatic)

### Backend (Heroku)
- [ ] Backend runs locally (`npm run dev`)
- [ ] `.env` file configured
- [ ] Procfile created
- [ ] Heroku app created
- [ ] Environment variables set
- [ ] Code pushed to Heroku
- [ ] Health check passing

### Integration
- [ ] Frontend has correct API URL
- [ ] CORS configured for Vercel domain
- [ ] Database (Supabase) accessible from both
- [ ] OpenAI API key working
- [ ] End-to-end test successful

---

## 📊 Vercel Project Settings (UI)

Go to https://vercel.com/dashboard → Select Project → Settings

### General
- **Project Name**: dd-iot-validator
- **Framework**: Vite
- **Build & Development Settings**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm ci`

### Environment Variables
```
VITE_API_URL=https://dd-iot-validator-api.herokuapp.com
VITE_API_TIMEOUT=30000
```

### Domains
- Add your custom domain or use vercel.app domain

### Git Integration
- GitHub: Connected
- Production Branch: main
- Auto-deploy on push: Enabled

### Speed Insights
- Enable Web Analytics (optional)

---

## 🔗 Connect Frontend to Backend

### In `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Vercel automatically reads `.env.production`:
```
VITE_API_URL=https://dd-iot-validator-api.herokuapp.com
```

---

## 🐛 Common Issues & Solutions

### Issue: "CORS Error"
```
Error: Access to XMLHttpRequest blocked by CORS policy

Solution:
1. Check backend CORS_ORIGIN env var matches Vercel domain
2. Verify backend is running
3. Test with curl: curl -H "Origin: YOUR_VERCEL_DOMAIN" https://backend.com/health
```

### Issue: "API undefined"
```
Error: Cannot reach API

Solution:
1. Check VITE_API_URL is set in Vercel environment
2. Verify backend is deployed and running
3. Check firewall/network access
```

### Issue: "Database Connection Failed"
```
Error: Unable to connect to Supabase

Solution:
1. Verify SUPABASE_URL and SUPABASE_KEY in backend env vars
2. Check Supabase project is active
3. Test connection: psql -h db.supabase.co -U ...
```

### Issue: "Resume Upload 413"
```
Error: Payload too large

Solution:
1. Check file size < 5MB
2. Verify request timeout settings
3. Check Vercel function timeout (60s is max)
```

---

## 📈 Monitor Deployments

### Vercel Dashboard
- https://vercel.com/dashboard
- View builds, deployments, logs
- Real-time analytics

### Heroku Dashboard
- https://dashboard.heroku.com
- View app logs
- Check metrics

### Vercel CLI - View Logs
```bash
vercel logs dd-iot-validator
```

### Heroku CLI - View Logs
```bash
heroku logs --tail -a dd-iot-validator-api
```

---

## 🔄 Deploy Updates

### Update Frontend
```bash
cd frontend
git add .
git commit -m "Update feature"
git push origin main
# Vercel auto-deploys
```

### Update Backend
```bash
cd backend
git add .
git commit -m "Update API"
git push heroku main
# Heroku auto-deploys
```

### Rollback if Needed
```bash
# Vercel: Dashboard → Deployments → Promote previous
# Heroku: heroku releases
#         heroku rollback v123
```

---

## 💰 Cost Breakdown (Monthly)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel Frontend | ✅ Included | Generous free tier |
| Heroku Backend | ⚠️ ~$7 | Eco plan (was free, now paid) |
| Supabase DB | ✅ Free tier | Up to 500MB |
| OpenAI API | Pay-as-you-go | ~$0.01-1.00 per interview |

**Total**: $10-50/month depending on usage

---

## 🚀 One-Click Alternative: Vercel + Firebase

### If You Want to Avoid Heroku Costs:

1. Deploy frontend to Vercel (free)
2. Use Firebase Functions for backend (free tier available)
3. Still use Supabase for database

See setup in separate guide if interested.

---

## 📋 Deployment Summary

```
Before Deployment:
├── Frontend ready (builds locally)
├── Backend ready (runs locally)
├── Database schema created (Supabase)
└── All env vars configured

After Deployment:
├── Frontend → Vercel.app
├── Backend → Heroku.com
├── Database → Supabase
└── Everything connected ✅
```

---

## 🎯 Testing After Deployment

### Test Frontend
```bash
# Visit your Vercel domain
https://dd-iot-validator.vercel.app

# Should see landing page
```

### Test Backend
```bash
# Health check
curl https://dd-iot-validator-api.herokuapp.com/health
# Should return: { status: "ok" }

# Test upload endpoint
curl -X POST https://dd-iot-validator-api.herokuapp.com/api/candidates/upload \
  -F "email=test@example.com" \
  -F "fullName=Test User" \
  -F "resume=@resume.pdf"
```

### Test Full Flow
1. Visit frontend: https://dd-iot-validator.vercel.app
2. Click Get Started
3. Upload resume
4. Take interview
5. See results

---

## 📞 Support & Next Steps

### If Deployment Fails:
1. Check Vercel logs: `vercel logs`
2. Check Heroku logs: `heroku logs --tail`
3. Verify environment variables are set
4. Test backend locally: `npm run dev`
5. Test connection: `curl BACKEND_URL/health`

### To Go Further:
- Add custom domain to Vercel
- Setup automatic deployments (already enabled)
- Enable Web Analytics on Vercel
- Setup monitoring/alerting
- Add CI/CD pipeline

---

## 🎉 Deployment Complete!

**Frontend**: https://YOUR_PROJECT.vercel.app  
**Backend**: https://YOUR_PROJECT-api.herokuapp.com  
**Database**: Supabase (secure, managed)  

Your system is now live! 🚀

---

**Questions?** See the main [SETUP.md](./SETUP.md) or [ARCHITECTURE.md](./ARCHITECTURE.md)
