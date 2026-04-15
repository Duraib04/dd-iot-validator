# ✅ Vercel Deployment Quick Checklist

## Pre-Deployment (5 minutes)

- [ ] Project pushed to GitHub
  ```bash
  git push origin main
  ```

- [ ] Check project structure:
  ```
  ✓ /frontend/api/*.js (5 serverless functions)
  ✓ /frontend/src/ (React app)
  ✓ vercel.json (configuration)
  ✓ .env.example (template)
  ```

---

## Step 1: Supabase Setup (5 minutes)

- [ ] Create Supabase project
  - Go to https://supabase.com
  - New Project
  - Note: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

- [ ] Deploy database schema
  - SQL Editor → New Query
  - Paste `database/schema.sql`
  - Run

- [ ] **COPY & SAVE:**
  ```
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_ANON_KEY=eyJhbGc...
  ```

---

## Step 2: OpenAI Setup (2 minutes)

- [ ] Get API key
  - https://platform.openai.com
  - API Keys → Create new

- [ ] Add $5-20 credits to account

- [ ] **COPY & SAVE:**
  ```
  OPENAI_API_KEY=sk-...
  ```

---

## Step 3: Email Service Setup (3 minutes)

**Choose ONE:**

### Resend (Easiest)
- [ ] https://resend.com → Sign up
- [ ] Copy API key
- [ ] **SAVE:** `RESEND_API_KEY=re_...`
- [ ] Set: `EMAIL_SERVICE=resend`

### SendGrid
- [ ] https://sendgrid.com → Sign up
- [ ] Settings → API Keys
- [ ] **SAVE:** `SENDGRID_API_KEY=SG...`
- [ ] Set: `EMAIL_SERVICE=sendgrid`

### Mailgun
- [ ] https://mailgun.com → Sign up
- [ ] Add domain
- [ ] **SAVE:** `MAILGUN_API_KEY=...` + `MAILGUN_DOMAIN=...`
- [ ] Set: `EMAIL_SERVICE=mailgun`

---

## Step 4: Vercel Setup (5 minutes)

- [ ] Create Vercel project
  - https://vercel.com/new
  - Import GitHub repo
  - Select `dd-iot-validator`

- [ ] Add Environment Variables (in Vercel):
  ```
  SUPABASE_URL=<from step 1>
  SUPABASE_ANON_KEY=<from step 1>
  OPENAI_API_KEY=<from step 2>
  EMAIL_SERVICE=<resend|sendgrid|mailgun>
  RESEND_API_KEY=<if using Resend>
  SENDGRID_API_KEY=<if using SendGrid>
  MAILGUN_API_KEY=<if using Mailgun>
  MAILGUN_DOMAIN=<if using Mailgun>
  ADMIN_EMAIL=your-email@company.com
  ```

- [ ] Deploy Project
  - Click "Deploy"
  - Wait 2-3 minutes

- [ ] **COPY:** Your Vercel URL
  ```
  https://your-project.vercel.app
  ```

---

## Step 5: Verify Deployment (3 minutes)

- [ ] Frontend loads: https://your-project.vercel.app
- [ ] API route test:
  ```bash
  curl https://your-project.vercel.app/api/upload
  ```

- [ ] Full test (optional):
  1. Upload sample resume (PDF)
  2. Answer 3 questions
  3. Complete evaluation
  4. Check email for notification

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on /api routes | Check vercel.json exists |
| Resume upload fails | Check OPENAI_API_KEY + Supabase connection |
| No email sent | Check ADMIN_EMAIL + email service credentials |
| Database errors | Verify schema.sql was run completely |
| Build fails | Check Node.js version (18.x) |

View logs:
```bash
vercel logs
```

---

## Post-Deployment

- [ ] Share URL: https://your-project.vercel.app
- [ ] Monitor at: https://vercel.com/dashboard
- [ ] Check logs: https://vercel.com/dashboard/...?tab=logs
- [ ] View data: https://app.supabase.com

---

## Environment Variables Reference

```env
# Required - Supabase
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...

# Required - OpenAI
OPENAI_API_KEY=sk-...

# Required - Email
EMAIL_SERVICE=resend|sendgrid|mailgun
ADMIN_EMAIL=your-email@company.com

# Email API Key (choose one)
RESEND_API_KEY=re_...
# OR
SENDGRID_API_KEY=SG...
# OR
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=mg.yourdomain.com
```

---

## Time Estimate

| Task | Time |
|------|------|
| Supabase setup | 5 min |
| OpenAI setup | 2 min |
| Email service | 3 min |
| Vercel deployment | 5 min |
| Testing | 3 min |
| **Total** | **~18 minutes** |

---

**Status: READY TO DEPLOY** ✅
