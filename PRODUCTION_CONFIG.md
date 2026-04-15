# Production Deployment Configuration

## 🏭 Production Environment Setup

### Pre-Deployment Checklist

#### Database (Supabase)
```
□ Project created in Supabase
□ Region selected (closest to users)
□ Organization set up
□ Database backed up
□ RLS policies configured
□ API keys secured
```

#### Backend (Heroku)
```
□ Heroku account created
□ App name decided: dd-iot-validator-api
□ All env vars set correctly
□ Procfile configured
□ Database connection tested
□ Health check endpoint working
□ Logs accessible
```

#### Frontend (Vercel)
```
□ GitHub repo created and code pushed
□ Vercel project created
□ Root directory set to "frontend"
□ Environment variables configured
□ Build works without errors
□ API URL points to production backend
```

#### Third-Party APIs
```
□ OpenAI account has active credits
□ OpenAI API key valid and secure
□ API usage limits set (optional)
□ Billing alerts configured
```

---

## 🔐 Security Configuration

### Environment Variables - NEVER Commit These

#### Backend (.env) - Keep Secure
```bash
# NEVER push .env to GitHub
# Set ONLY via Heroku dashboard or CLI

NODE_ENV=production
PORT=5000  # Heroku assigns this

# CRITICAL - SECURE THESE
OPENAI_API_KEY=sk-proj-...  # Keep private!
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...  # Public key, but secure location

# MUST match production domain
CORS_ORIGIN=https://dd-iot-validator.vercel.app

LOG_LEVEL=info  # Don't use 'debug' in production
```

#### Frontend (.env) - Public is OK
```bash
# These are OK to be public (visible in frontend)
VITE_API_URL=https://dd-iot-validator-api.herokuapp.com
VITE_API_TIMEOUT=30000
```

### Securing Secrets

```bash
# ✅ DO: Store secrets in Heroku config
heroku config:set OPENAI_API_KEY=sk-...

# ✅ DO: Use Vercel environment variables dashboard
# https://vercel.com/dashboard → Settings → Environment Variables

# ❌ DON'T: Commit .env file
# ❌ DON'T: Share API keys in chat or email
# ❌ DON'T: Log API keys
```

---

## 📊 Production Architecture

```
Users
  ↓
HTTPS (Vercel CDN)
  ↓
Frontend (React SPA)
  ├─ Hosted on Vercel
  ├─ Edge locations globally
  └─ Static + dynamic rendering
       ↓
HTTPS API Calls
  ↓
Backend (Node.js)
  ├─ Hosted on Heroku
  ├─ Single Dyno (or scaled)
  ├─ Auto-restarts on crash
  └─ Rate limited
       ↓
PostgreSQL (Supabase)
  ├─ Managed database
  ├─ Encrypted at rest
  ├─ Daily backups
  └─ Point-in-time recovery
       ↓
OpenAI API
  └─ HTTPS calls for AI evaluation
```

---

## 🔄 Monitoring & Alerting

### Vercel Monitoring
```
https://vercel.com/dashboard → project → Analytics

Monitor:
- Requests per second
- Error rate
- Response time (p50, p95, p99)
- Edge Network Distribution
```

### Heroku Monitoring
```bash
# View metrics
heroku logs --tail

# Monitor dyno health
heroku ps -a dd-iot-validator-api

# Check recent errors
heroku logs --dyno=web
```

### Set Up Alerts (Optional)

**Heroku Alerts**:
- Status Page: https://heroku-status.com
- Signup for incident alerts

**Vercel Alerts**:
- Dashboard → Settings → Alerts
- Set error threshold

---

## 📈 Scaling Strategy

### Current Setup (Free/Low Cost)

| Component | Plan | Cost |
|-----------|------|------|
| Frontend | Vercel Free | $0 |
| Backend | Heroku Eco | $6/mo |
| Database | Supabase Free | $0 |
| AI API | Pay-as-you-go | $10-50/mo |
| **Total** | | ~$16-56/mo |

### When to Scale

**When traffic increases**:
- Frontend: Vercel automatically scales (no action needed)
- Backend: Upgrade from Eco → Standard 1X/2X
- Database: Supabase Plan → Pro

**Command to upgrade backend**:
```bash
heroku dyno:type standard-1x -a dd-iot-validator-api
```

### Expected Limits (Current Setup)

- 10-50 concurrent users
- 1,000 resumes/month
- 10,000 API calls/month
- 500MB database

---

## 🔍 Health Checks

### Daily Health Check

```bash
#!/bin/bash

# Check frontend
curl -s -o /dev/null -w "%{http_code}" https://dd-iot-validator.vercel.app
# Should return 200

# Check backend
curl https://dd-iot-validator-api.herokuapp.com/health
# Should return: {"status":"ok"}

# Check database (via backend)
curl https://dd-iot-validator-api.herokuapp.com/api/candidates/test
# Should return valid response or expected error
```

### Weekly Review

```
□ Check Heroku logs for errors
□ Verify OpenAI API usage
□ Review Vercel analytics
□ Check database size
□ Monitor error rates
```

---

## 🚨 Incident Response

### Backend Down

```bash
# Check status
heroku ps -a dd-iot-validator-api

# Restart dyno
heroku dyno:restart -a dd-iot-validator-api

# View recent logs
heroku logs -100 --tail -a dd-iot-validator-api

# If crashes persist:
heroku logs -500 | grep -i error
```

### Database Unreachable

```
Check:
1. Supabase dashboard status
2. Network connectivity
3. Connection string correctness
4. Firewall rules

Solution:
1. Check Supabase status page
2. Try reconnecting
3. Restore from backup if needed
```

### API Over-Rate-Limited

```
Symptoms:
- 429 status code
- "Too many requests"

Fix:
1. Check OpenAI API usage
2. Reduce request frequency
3. Implement caching
4. Upgrade OpenAI plan
```

### SSL/HTTPS Issues

```
Usually auto-handled by:
- Vercel (automatic SSL)
- Heroku (free SSL)
- Supabase (auto SSL)

If issues:
1. Wait 15-30 minutes (SSL propagation)
2. Hard refresh browser (Ctrl+Shift+R)
3. Check DNS settings (if custom domain)
```

---

## 📝 Maintenance Schedule

### Daily
- Monitor error rates
- Check server health
- Review logs for patterns

### Weekly
- Review analytics
- Check database size
- Update dependencies (if running locally)
- Monitor costs

### Monthly
- Database backup verification
- Security audit
- Performance review
- Capacity planning

### Quarterly
- Dependency updates (in development)
- Security scanning
- Disaster recovery drill
- Infrastructure audit

---

## 🔄 Deployment Pipeline

### Development Flow
```
1. Make changes
2. Test locally (npm run dev)
3. Commit to GitHub
4. Push to feature branch
5. Create Pull Request
6. Review & test
7. Merge to main
```

### Automatic Deployment (Vercel)
```
main branch push
    ↓
GitHub webhook
    ↓
Vercel receives event
    ↓
npm install
    ↓
npm run build
    ↓
Deploy to CDN
    ↓
Vercel dashboard shows "Ready" ✓
```

### Backend Deployment (Manual)
```bash
cd backend
git add .
git commit -m "Feature: descriptive message"
git push heroku main  # Direct push triggers deploy
```

---

## 💰 Cost Monitoring

### OpenAI API Usage

```bash
# Check usage via API
curl https://api.openai.com/dashboard/billing/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Estimate costs:
# - Resume analysis: 1 call × $0.005 = $0.005
# - Question generation: 9 calls × $0.002 = $0.018
# - Total per candidate: ~$0.023

# 100 candidates: $2.30
# 1000 candidates: $23
# 10000 candidates: $230
```

### Set Budget Alert

```
OpenAI Dashboard:
1. Go to https://platform.openai.com/account/billing/limits
2. Set Monthly budget limit
3. Set email alerts
```

### Estimate Total Monthly Cost

```
Vercel (Frontend):    $0-50 (free tier generous)
Heroku (Backend):     $6-25 (Eco or standard)
Supabase (Database):  $0-25 (free tier generous)
OpenAI (API):         $10-100 (usage based)
Monitoring:           $0-50 (optional)
─────────────────────────────────
Total Range:          $16-250/month

Most likely (starting): $30-50/month
```

---

## 🎓 Production Best Practices

### Error Handling
```javascript
// ✅ DO: Graceful error responses
{ success: false, message: "User-friendly error", errors: [...] }

// ❌ DON'T: Expose system details
{ error: "Stack trace details...", code: 500 }
```

### Logging
```javascript
// ✅ DO: Log important events
console.log('[INFO]', 'Candidate created:', candidateId);

// ❌ DON'T: Log sensitive data
console.log('[DEBUG]', 'API Key:', apiKey);
```

### Database
```javascript
// ✅ DO: Use parameterized queries (already done via Supabase)
// ❌ DON'T: String concatenation in SQL
```

### API Security
```
✅ CORS restricted to your domain
✅ SSL/HTTPS enabled
✅ Rate limiting active (100 req/min)
✅ Input validation on all fields
✅ API keys in environment variables
```

---

## 📋 Production Deployment Checklist

### Before Going Live

- [ ] Database backed up
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] Rate limiting enabled
- [ ] Error handling tested
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] API keys stored securely
- [ ] Monitoring enabled
- [ ] Load testing done (optional)

### After Going Live

- [ ] Health checks passing
- [ ] Test upload resume
- [ ] Test full interview flow
- [ ] Test results page
- [ ] Monitor for errors (first hour)
- [ ] Check performance metrics
- [ ] Verify email/notifications (if any)
- [ ] Alert team of go-live
- [ ] Document URLs & access
- [ ] Set up on-call rotation

---

## 📞 Production Support

### Get Help

1. **Check status pages**:
   - Vercel: https://www.vercel-status.com
   - Heroku: https://heroku-status.com
   - Supabase: https://status.supabase.com

2. **Review logs**:
   - Vercel: Dashboard → Function Logs
   - Heroku: `heroku logs --tail`
   - Supabase: Dashboard → Logs

3. **Test connectivity**:
   ```bash
   # Frontend available?
   curl https://dd-iot-validator.vercel.app

   # Backend available?
   curl https://dd-iot-validator-api.herokuapp.com/health

   # Database available?
   # (Check via Supabase dashboard)
   ```

---

## 🎉 Production Ready Checklist

✅ Frontend deployed on Vercel  
✅ Backend deployed on Heroku  
✅ Database on Supabase  
✅ All env variables configured  
✅ SSL/HTTPS enabled  
✅ Monitoring active  
✅ Health checks passing  
✅ Full workflow tested  
✅ Team notified  
✅ Documentation updated  

---

**Your system is production-ready! 🚀**

For questions, see: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) or [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
