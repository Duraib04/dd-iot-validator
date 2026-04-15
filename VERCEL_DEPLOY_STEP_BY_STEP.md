# 🚀 Vercel Deployment Guide - Serverless Only

Complete step-by-step instructions to deploy the DD IoT Candidate Validator to Vercel with serverless API functions.

## Overview

This solution runs **100% on Vercel** with:
- ✅ Frontend: React app hosted on Vercel  
- ✅ Backend: Serverless functions in `/api` folder  
- ✅ Database: PostgreSQL via Supabase (free tier)  
- ✅ AI: OpenAI GPT-4 API  
- ✅ Email: Resend/SendGrid/Mailgun API  

**Cost**: $0-15/month (Supabase $10 optional, email service ~$0-5)

---

## Prerequisites

✅ GitHub account  
✅ Vercel account (free)  
✅ Supabase account (free)  
✅ OpenAI API key ($5+ credits required)  
✅ Email service (Resend/SendGrid/Mailgun) - one is free tier

---

## Step 1: Prepare Your Local Repository

### 1.1 Create GitHub Repository

```bash
# Navigate to your project
cd dd-iot-validator

# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit: Vercel serverless deployment ready"

# Create new repo on GitHub at github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/dd-iot-validator.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Project Structure

```
dd-iot-validator/
├── frontend/
│   ├── api/                    # Vercel serverless functions
│   │   ├── config.js          # Environment variable setup
│   │   ├── upload.js          # Resume upload endpoint
│   │   ├── question.js        # Next question endpoint
│   │   ├── answer.js          # Answer evaluation endpoint
│   │   ├── finalize.js        # Score calculation endpoint
│   │   └── send-email.js      # Email notification endpoint
│   ├── src/                   # React app
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql             # PostgreSQL schema
├── vercel.json                # Vercel configuration
├── .env.example               # Environment variables template
└── README.md
```

---

## Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name: `dd-iot-validator`
4. Create a strong password
5. Select region closest to you
6. Create project (wait 1-2 minutes for setup)

### 2.2 Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of [`database/schema.sql`](database/schema.sql)
4. Paste into SQL editor
5. Click "Run"
6. Verify: Go to **Tables** → should see 7 tables created

### 2.3 Get Your Credentials

In Supabase dashboard:
1. Go to **Settings** → **API**
2. Copy `Project URL` → Save as `SUPABASE_URL`
3. Copy `anon public` key → Save as `SUPABASE_ANON_KEY`

---

## Step 3: Set Up OpenAI API

### 3.1 Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Login/create account
3. Click your profile → "API keys"
4. Click "Create new secret key"
5. Copy key → Save as `OPENAI_API_KEY`
6. Add $5-20 credits to your account

---

## Step 4: Set Up Email Service

Choose ONE email service (or start with Resend, easiest):

### Option A: Resend (Recommended - Easiest)

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. In dashboard, go to **API Keys**
4. Copy key → Save as `RESEND_API_KEY`
5. Verify your domain (optional for testing)

### Option B: SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up
3. Go to Settings → **API Keys**
4. Create new API key
5. Copy key → Save as `SENDGRID_API_KEY`
6. Verify sender (your email)

### Option C: Mailgun

1. Go to [mailgun.com](https://mailgun.com)
2. Sign up
3. Add domain (or use sandbox domain)
4. Get **API Key** from domain settings
5. Copy key + domain → Save as `MAILGUN_API_KEY` and `MAILGUN_DOMAIN`

---

## Step 5: Deploy to Vercel

### 5.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Paste your GitHub URL: `https://github.com/YOUR_USERNAME/dd-iot-validator`
5. Click "Import"

### 5.2 Configure Environment Variables

In Vercel deployment settings:

1. **Project Settings** → **Environment Variables**
2. Add each variable:

```
SUPABASE_URL                = https://xxxxx.supabase.co
SUPABASE_ANON_KEY          = eyJhbGc...
OPENAI_API_KEY             = sk-...
EMAIL_SERVICE              = resend
RESEND_API_KEY             = re_... (or SENDGRID_API_KEY / MAILGUN keys)
ADMIN_EMAIL                = your-email@company.com
```

3. Select environment: **Production** for all
4. Click "Save"

### 5.3 Deploy

1. Click **Deploy** button
2. Wait for build & deployment (2-3 minutes)
3. Get your Vercel URL: `https://your-project.vercel.app`

---

## Step 6: Test Your Deployment

### 6.1 Test Frontend

```bash
# Visit your Vercel URL
https://your-project.vercel.app

# You should see:
✓ Landing page loads
✓ Navigation works
✓ UI is responsive
```

### 6.2 Test API Endpoints

```bash
# Test upload endpoint
curl -X POST https://your-project.vercel.app/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test Candidate",
    "resumeBase64": "JVBERi0xLjQK..."  # base64 encoded PDF
  }'

# Should return: { success: true, data: { candidateId: "...", analysis: {...} } }
```

### 6.3 Full Workflow Test

1. Visit https://your-project.vercel.app
2. Upload a sample resume (PDF)
3. Answer 5 interview questions
4. Complete evaluation
5. Check your email for candidate notification

---

## Step 7: Monitor & Troubleshoot

### 7.1 View Logs

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# View logs
vercel logs --scope=your-username
```

### 7.2 Common Issues

**❌ "Resume upload fails"**
- Check: PDF is valid, < 5MB
- Check: OPENAI_API_KEY is set and valid
- Check: SUPABASE_URL and SUPABASE_ANON_KEY are correct

**❌ "Email not sending"**
- Check: ADMIN_EMAIL is set
- Check: Email service API key is valid
- Check: EMAIL_SERVICE matches your chosen service

**❌ "Questions not generating"**
- Check: SUPABASE tables are created
- Check: candidateId is valid
- Check: PostgreSQL queries in question.js are correct

**❌ "500 error on any endpoint"**
```bash
# Check function logs
vercel logs

# Check Supabase logs at supabase.com dashboard
```

---

## Step 8: Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase database created & schema deployed
- [ ] OpenAI API key with credits
- [ ] Email service configured
- [ ] Admin email verified
- [ ] Test upload & full workflow
- [ ] Check email notifications work
- [ ] Enable CORS if needed (usually not needed on Vercel)
- [ ] Set up monitoring (optional)
- [ ] Backup Supabase regularly

---

## Step 9: Update & Redeploy

### To push code changes:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel auto-deploys on push to `main` branch.

### To update environment variables:

1. Go to Vercel dashboard
2. Project Settings → Environment Variables
3. Update value
4. Redeploy: Click "Redeploy"

---

## Step 10: Scaling & Optimization

### Increase Function Timeout (if needed)

Edit `vercel.json`:
```json
"functions": {
  "api/**/*.js": {
    "maxDuration": 120  // increase to 120 seconds if needed
  }
}
```

### Monitor Usage

- **Vercel**: Check dashboard for API calls, errors
- **Supabase**: Check Storage usage (free tier: 500MB)
- **OpenAI**: Check credits at platform.openai.com
- **Email service**: Check email quota

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     USER BROWSER                              │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────────────┐
│                 VERCEL EDGE NETWORK                           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Frontend (React + Vite)                              │   │
│  │  ├─ Landing Page                                      │   │
│  │  ├─ Resume Upload                                     │   │
│  │  ├─ Interview (AI Chatbot)                            │   │
│  │  └─ Results                                           │   │
│  └───────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Serverless Functions (/api)                          │   │
│  │  ├─ /api/upload → Parse PDF, extract with GPT-4      │   │
│  │  ├─ /api/question → Generate question, store in DB   │   │
│  │  ├─ /api/answer → Evaluate answer, score (0-10)      │   │
│  │  ├─ /api/finalize → Calculate total scores         │   │
│  │  └─ /api/send-email → Send to admin if score > 30   │   │
│  └────────┬────────────────────────────────────────────┬────┘
└───────────┼────────────────────────────────────────────┼─────┘
            │ HTTPS                                      │ HTTPS
            │                                            │
┌───────────▼─────────────┐                   ┌─────────▼────────────┐
│  SUPABASE PostgreSQL    │                   │ OPENAI GPT-4 API     │
│  ├─ Candidates          │                   └──────────────────────┘
│  ├─ Resume Analysis     │
│  ├─ Interview Answers   │
│  ├─ Scores              │
│  └─ Email Logs          │                   ┌──────────────────────┐
└─────────────────────────┘                   │ Email Service        │
                                              │ (Resend/SendGrid)    │
                                              └──────────────────────┘
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Resend Docs**: https://resend.com/docs
- **GitHub Issues**: Create issue in your repo

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | 100GB bandwidth | $0 |
| Supabase DB | 500MB storage, 2M req/month | $10/month (optional) |
| OpenAI API | None (pay as you go) | ~$0.01/resume, ~$0.05/interview |
| Resend Email | 100/day during trial | $0.20 per 1000 after |
| **Total** | **~Free** | **$10-15/month** |

---

## Next Steps

1. ✅ Deploy to Vercel following above steps
2. ✅ Test full workflow
3. ✅ Share URL with candidates
4. ✅ Monitor Supabase for data
5. ✅ Review email notifications
6. ✅ Optimize scoring rules based on results

**Your app is now live! 🎉**

```
https://your-project.vercel.app
```
