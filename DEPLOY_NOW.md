# 🚀 Deploy to Vercel NOW (5 Minutes)

**Code is ready on GitHub:** https://github.com/Duraib04/dd-iot-validator

## Step 1: Connect to Vercel (3 minutes)

1. Go to https://vercel.com
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Paste: `https://github.com/Duraib04/dd-iot-validator`
5. Click **"Import"**

## Step 2: Configure Project (1 minute)

**Vercel will auto-detect settings**, but if asked:

```
Framework Preset: → (Leave blank, will auto-detect)
Root Directory: → (Leave blank)
Build Command: → npm run build
Output Directory: → dist
```

## Step 3: Environment Variables (1 minute)

**You can ADD THESE LATER!** For now, just deploy with empty values:

Click **"Add Environment Variables"** and add:

```
SUPABASE_URL = (leave empty for now)
SUPABASE_ANON_KEY = (leave empty for now)
OPENAI_API_KEY = (leave empty for now)
EMAIL_SERVICE = resend
RESEND_API_KEY = (leave empty for now)
ADMIN_EMAIL = your-email@company.com
```

**You can edit these anytime in Vercel Dashboard → Settings → Environment Variables**

## Step 4: Deploy! 

Click **"Deploy"** button

Wait 2-3 minutes... ✅ **DONE!**

---

## Your Live URL

After deployment completes, you'll get:
```
https://dd-iot-validator.vercel.app
```

---

## Step 5: Add API Keys Later

Once you have your API keys from:
- ✅ Supabase (SUPABASE_URL, SUPABASE_ANON_KEY)
- ✅ OpenAI (OPENAI_API_KEY)
- ✅ Email Service (RESEND_API_KEY, etc.)

1. Go to **Vercel Dashboard**
2. Select **dd-iot-validator** project
3. Go to **Settings** → **Environment Variables**
4. Update the values
5. **Redeploy**: Click **Deployments** → **Redeploy**

---

## That's It!

✅ App deployed at: `https://dd-iot-validator.vercel.app`
✅ Code on GitHub: `https://github.com/Duraib04/dd-iot-validator`
✅ Frontend loads immediately
✅ API functions ready (will error until you add API keys)
✅ Database functions ready (will error until you add Supabase keys)

**When you're ready with keys, just update environment variables in Vercel!**
