# 🚀 Vercel Deployment - Quick Checklist

## 5-Step Vercel Deployment (Option 1: Recommended)

### ✅ STEP 1: Prepare Frontend (5 min)

```bash
# Test build locally
cd frontend
npm run build
npm run preview
# Should see app running at http://localhost:4173

# If stuck on "npm run build", check:
# - Node version: node --version (need 18+)
# - Dependencies installed: npm install
```

### ✅ STEP 2: Push to GitHub (5 min)

```bash
# Go to https://github.com/new
# Create new repo: "dd-iot-validator"

# In terminal from frontend directory:
git init
git add .
git commit -m "Initial frontend deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dd-iot-validator.git
git push -u origin main

# Verify on GitHub - should see your code
```

### ✅ STEP 3: Deploy to Vercel (5 min)

Go to https://vercel.com/new
- Click "Import Git Repository"
- Paste GitHub URL: `https://github.com/YOUR_USERNAME/dd-iot-validator.git`
- Root Directory: `frontend`
- Framework: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Click **Deploy**

✨ Frontend is now live! Copy the URL.

### ✅ STEP 4: Deploy Backend to Heroku (10 min)

```bash
# 1. Create Heroku account at https://heroku.com

# 2. Install Heroku CLI
npm install -g heroku

# 3. Login
heroku login

# 4. Go to backend
cd backend

# 5. Create Procfile
echo "web: npm start" > Procfile

# 6. Create Heroku app
heroku create dd-iot-validator-api

# 7. Set environment variables
heroku config:set OPENAI_API_KEY=sk-YOUR_KEY_HERE
heroku config:set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
heroku config:set SUPABASE_KEY=YOUR_ANON_KEY
heroku config:set CORS_ORIGIN=https://YOUR_VERCEL_DOMAIN.vercel.app
heroku config:set NODE_ENV=production

# 8. Deploy
git init
git add .
git commit -m "Initial backend"
heroku git:remote -a dd-iot-validator-api
git push heroku main

# 9. Check logs
heroku logs --tail

# Should see: "Server running on http://0.0.0.0:5000"
```

Copy your Heroku backend URL (e.g., `https://dd-iot-validator-api.herokuapp.com`)

### ✅ STEP 5: Connect Frontend to Backend (2 min)

**In Vercel Dashboard**:
1. Go to https://vercel.com/dashboard
2. Click your project: `dd-iot-validator`
3. Click **Settings** → **Environment Variables**
4. Add new variable:
   - Name: `VITE_API_URL`
   - Value: `https://dd-iot-validator-api.herokuapp.com`
5. Click **Save**
6. Click **Deployments** → **Promote** latest to production

Wait 1 minute for deployment to finish.

---

## ✅ Testing Checklist

| Test | Command | Expected |
|------|---------|----------|
| Backend health | `curl https://YOUR-BACKEND.herokuapp.com/health` | `{"status":"ok"}` |
| Frontend loads | Visit `https://YOUR-FRONTEND.vercel.app` | Landing page appears |
| Upload works | Upload resume on app | Gets processed |
| Interview works | Answer questions | Scores appear |
| Results work | Submit interview | Dashboard shows results |

---

## 🎯 Quick Reference

| What | Where | URL |
|-----|-------|-----|
| Frontend | Vercel | `https://dd-iot-validator.vercel.app` |
| Backend | Heroku | `https://dd-iot-validator-api.herokuapp.com` |
| Database | Supabase | Dashboard at supabase.com |
| Logs (Frontend) | Vercel dashboard | Deployments tab |
| Logs (Backend) | Terminal | `heroku logs --tail` |

---

## 🆘 Stuck?

### "Build failed on Vercel"
```bash
# Fix locally first
cd frontend
npm install
npm run build  # Should work without errors
```

### "Backend not responding"
```bash
# Check backend is running
heroku ps -a dd-iot-validator-api
# Should show: web.1 up

# Check logs
heroku logs --tail -a dd-iot-validator-api
```

### "CORS error in console"
```
Solution:
1. Verify CORS_ORIGIN env var matches your exact Vercel URL
2. Wait 1-2 minutes after changing env vars
3. Hard refresh browser (Ctrl+Shift+R)
```

### "Resume upload fails"
```
Check:
1. Backend is running: heroku ps
2. Supabase credentials are correct
3. File is valid PDF < 5MB
```

---

## 📱 Live URLs After Deployment

Once complete, you'll have:

```
Landing Page:     https://YOUR_PROJECT.vercel.app
Upload Page:      https://YOUR_PROJECT.vercel.app/upload
Interview Page:   https://YOUR_PROJECT.vercel.app/interview
Results Page:     https://YOUR_PROJECT.vercel.app/results

Backend API:      https://YOUR_PROJECT-api.herokuapp.com
Health Check:     https://YOUR_PROJECT-api.herokuapp.com/health
```

---

## 🎉 Success Indicators

✅ You see landing page when visiting Vercel URL
✅ Resume upload button is clickable
✅ Can upload a PDF without errors
✅ Interview questions appear
✅ Can answer and see scores
✅ Results dashboard loads with decision

---

## 💾 Environment Variables Summary

### Backend (Heroku)
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_KEY=...
CORS_ORIGIN=https://your-vercel-app.vercel.app
NODE_ENV=production
PORT=5000
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-heroku-backend.herokuapp.com
```

### Database (Supabase)
```
Already created in Step 1 of QUICKSTART.md
```

---

## 🚀 After Deployment

### Keep App Awake (Optional - Heroku)

Heroku free (Eco plan) may have sleep periods. To keep it active:

```bash
# Install heroku-wake-dyno or similar
# Or use external monitoring service like uptimerobot.com
```

### Monitor Usage

```bash
# Check Heroku usage
heroku account:info

# Check OpenAI usage
poetry platform.openai.com/account/usage/overview
```

### Update Code

```bash
# Frontend changes auto-deploy via GitHub
# Backend changes:
git add .
git commit -m "Update message"
git push heroku main
```

---

## 📞 Next Steps

1. **Deployed?** Celebrate! 🎉
2. **Share URL** with your team
3. **Gather Feedback** on the app
4. **Add Features** (see BUILD_SUMMARY.md)
5. **Monitor Usage** and costs
6. **Scale When Ready** (move to paid plans)

---

**DONE! Your app is live on Vercel + Heroku! 🚀**

Questions? Check the full [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
