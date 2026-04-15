# 🚀 Quick Start Guide

## 5-Minute Setup

### Prerequisites Check
```bash
# Check Node.js version (need 18+)
node --version
npm --version

# Have ready:
# - Supabase account (free tier available)
# - OpenAI API key ($5-20/month for testing)
```

### Step 1: Get Your Keys & URLs

1. **OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create new secret key
   - Keep it safe

2. **Supabase Credentials**
   - Create account at https://supabase.com
   - New project in any region
   - Go to Settings → API
   - Copy Project URL and anon/public key

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install packages
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
OPENAI_API_KEY=sk-your-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
EOF

# Start server (should see green checkmark)
npm run dev
# ✓ Server running on http://localhost:5000
```

### Step 3: Setup Database

```bash
# In Supabase dashboard:
# 1. SQL Editor → New Query
# 2. Copy entire contents of database/schema.sql
# 3. Paste and Execute
# 4. Done!
```

### Step 4: Setup Frontend

```bash
# In new terminal, navigate to frontend
cd frontend

# Install packages
npm install

# Start development server
npm run dev
# ✓ Local: http://localhost:5173
```

### Step 5: Test It!

1. Open http://localhost:5173 in browser
2. Click "Get Started"
3. Upload a resume (PDF)
4. Answer interview questions
5. See results! 🎉

---

## 📝 Sample Resume for Testing

Create a test resume with this content in a PDF file:

```
John Doe
john@example.com | (555) 123-4567

EXPERIENCE
Senior IoT Engineer (3 years)
- Developed firmware for microcontroller projects using C++
- Designed MQTT-based sensor networks
- Implemented edge computing solutions

IoT Developer (2 years)
- Arduino and Raspberry Pi projects
- IoT protocol implementation (MQTT, CoAP)
- Real-time data processing

SKILLS
- Languages: Python, C++, JavaScript
- IoT: Arduino, ESP32, Raspberry Pi
- Protocols: MQTT, Bluetooth, LoRaWAN
- Hardware: Embedded Systems, PCB Design
- Databases: SQL, PostgreSQL

EDUCATION
B.S. in Electrical Engineering
State University, 2019

PROJECTS
- Smart Home IoT Hub: Built MQTT broker for home automation
- Wearable Health Monitor: Designed BLE wearable with analytics
- Industrial Sensor Network: Designed multisensor edge device
```

---

## 🐛 Common Issues

### "Cannot connect to Supabase"
```bash
# Check:
1. Credentials are correct in .env
2. Supabase project is active (check dashboard)
3. Network connectivity (ping supabase.com)
```

### "OpenAI API Error"
```bash
# Check:
1. API key is correct (no spaces/quotes)
2. You have usage credits (check account)
3. API is not rate limited
```

### "Port already in use"
```bash
# Backend (5000):
lsof -i :5000
kill -9 <PID>

# Frontend (5173):
lsof -i :5173
kill -9 <PID>
```

### "PDF upload fails"
- Ensure file is valid PDF
- File size under 5MB
- No corrupted PDF

---

## 🎯 What Happens Step-by-Step

### Upload Phase
```
Resume PDF (5MB max)
    ↓
Extract text (pdfparse)
    ↓
Send to GPT-4 (extract skills)
    ↓
Save to database
    ↓
Calculate resume scores → Show candidate
```

### Interview Phase
```
Button click: "Get Next Question"
    ↓
Generate with GPT-4 (context-aware)
    ↓
Show question to candidate
    ↓
Candidate types answer
    ↓
Send to GPT-4 for evaluation
    ↓
Get score + feedback
    ↓
Show to candidate
    ↓
Repeat until 10 questions
```

### Results Phase
```
All interviews complete
    ↓
Calculate 4 scores (0-10 each)
    ↓
Total score (0-40)
    ↓
Make decision:
  - > 30: Selected ✅
  - 20-30: Training 📚
  - < 20: Rejected ❌
    ↓
Show dashboard with all metrics
```

---

## 💾 Data Location

### Backend Process Memory
- Current question ID
- Current answer being evaluated
- Session state

### Database (Supabase)
- All candidate info
- All skills extracted
- All questions & answers
- All scores & decisions
- Interview history

### Frontend LocalStorage
- candidateId
- candidateEmail
- candidateName

---

## 🧪 Test Scenarios

### Scenario 1: Strong Candidate
- Resume: 5+ years IoT experience
- Skills: Arduino, Python, MQTT
- Answers: Detailed, technical, clear
- Expected Score: 32-40 (Selected) ✅

### Scenario 2: Mid-Level Candidate
- Resume: 2-3 years experience
- Skills: Some IoT, general programming
- Answers: Good but lacks depth
- Expected Score: 22-28 (Needs Training) 📚

### Scenario 3: Junior Candidate
- Resume: Entry-level, no IoT experience
- Skills: Basic programming only
- Answers: Simple, correct but surface-level
- Expected Score: 15-20 (Rejected) ❌

---

## 📊 Performance Notes

### Response Times (Typical)
- Resume upload: 3-5 seconds
- Question generation: 2-4 seconds
- Answer evaluation: 2-3 seconds
- Finalize: 1-2 seconds

### Database Queries
- All indexed for performance
- Typical query: < 100ms
- At scale: Add Redis cache

### API Calls to OpenAI
- Per resume: 1 call (parsing)
- Per question: 2 calls (generate + evaluate)
- Per interview: ~21 calls total

---

## 💰 Cost Estimation (Monthly)

### Services
- **Supabase**: Free tier (0-50 free users)
- **OpenAI API**: ~$0.01 per resume + ~$0.10 per interview
  - 100 candidates/month: ~$11
  - 1000 candidates/month: ~$110
  - 10000 candidates/month: ~$1,100

- **Hosting**: Depends on platform
  - Heroku: $7/month (free tier available)
  - Vercel: Free for frontend

**Total**: $10-25/month for small scale

---

## 🎓 Learning Resources

### For Customization
- OpenAI API: https://platform.openai.com/docs
- React Docs: https://react.dev
- Supabase Docs: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs

### For Deployment
- Heroku: https://devcenter.heroku.com
- Vercel: https://vercel.com/docs
- Azure: https://docs.microsoft.com/azure

---

## ✅ Verification Checklist

After setup, verify everything works:

```
□ Backend running (curl http://localhost:5000/health)
□ Frontend running (http://localhost:5173 loads)
□ Supabase connected (no DB errors)
□ OpenAI API working (can call in backend)
□ CSS loaded (page looks styled, not plain)
□ All forms working (can type in inputs)
□ Resume upload works
□ Interview questions appear
□ Scores calculated
□ Results page displays
```

---

## 🆘 Get Help

1. **Check logs**: Backend console shows errors
2. **Browser DevTools**: Frontend console shows issues
3. **Response format**: API returns error messages
4. **Documentation**: See ARCHITECTURE.md and API.md

---

Good luck! You're ready to run the system. 🚀

**Questions?** Check the comprehensive docs:
- [Full Architecture](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Setup Guide](./SETUP.md)
