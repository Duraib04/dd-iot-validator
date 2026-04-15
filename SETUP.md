# DD IoT Validator - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (via Supabase)
- OpenAI API key
- Git

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Fill in .env with your credentials
# OPENAI_API_KEY=sk-...
# SUPABASE_URL=https://...
# SUPABASE_KEY=...
# CORS_ORIGIN=http://localhost:5173

# 5. Start development server
npm run dev
# Server will run on http://localhost:5000
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# Frontend will run on http://localhost:5173
```

## 🗄️ Database Setup

### Using Supabase

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Get your URL and API key

2. **Run Schema**
   ```sql
   -- Copy entire contents of database/schema.sql
   -- Paste into Supabase SQL editor
   -- Execute
   ```

3. **Enable RLS (Row Level Security)**
   - Security → RLS Enabled
   - Set policies for multi-tenancy (optional)

### Alternative: Local PostgreSQL

```bash
# Docker setup
docker run --name dd-iot-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=ddiot \
  -e POSTGRES_DB=ddiot_validator \
  -p 5432:5432 \
  -d postgres:15

# Connect and run schema
psql -h localhost -U ddiot -d ddiot_validator < database/schema.sql
```

## 💻 Development Workflow

### API Endpoints

```
# Resume Upload
POST /api/candidates/upload
  - Body: { email, fullName, resume (PDF file) }
  - Returns: { candidateId, analysis, resumeScores }

# Get Next Question
POST /api/candidates/:candidateId/next-question
  - Returns: { questionId, question, type, difficulty }

# Submit Answer
POST /api/candidates/:candidateId/submit-answer
  - Body: { questionId, answer }
  - Returns: { score, feedback, communication, technical }

# Finalize Interview
POST /api/candidates/:candidateId/finalize
  - Returns: { scores, report, questionsAnswered }

# Get Results
GET /api/candidates/:candidateId/results
  - Returns: { summary, scores, analysis }
```

### Environment Variables

**Backend (.env)**:
```
NODE_ENV=development
PORT=5000
OPENAI_API_KEY=sk-your-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

**Frontend (.env - optional)**:
```
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=30000
```

## 📊 Scoring Algorithm

### Formula

```
Total Score = Hardware + Programming + Problem-Solving + Communication
Max Score: 40

Decision Logic:
- Score > 30: SELECTED ✅
- 20-30: NEEDS_TRAINING 📚
- < 20: REJECTED ❌
```

### Component Scoring

**Hardware Knowledge (0-10)**:
- Calculated from resume analysis
- IoT relevance score × 10
- Bonuses for embedded systems keywords

**Programming (0-10)**:
- Years of experience × 0.5
- Number of technologies × 0.5
- +2 base score

**Problem-Solving (0-10)**:
- Average technical interview question scores

**Communication (0-10)**:
- Average communication ratings from all answers

## 🤖 AI Integration

### OpenAI API Usage

The system uses GPT-4 for:

1. **Resume Parsing** (`resumeParser.js`)
   - Extracts skills, projects, experience
   - Calculates IoT relevance
   - Structure: JSON extraction

2. **Question Generation** (`chatbot.js`)
   - Generates adaptive questions
   - Adjusts difficulty based on performance
   - Context-aware from resume

3. **Answer Evaluation** (`chatbot.js`)
   - Scores responses 0-10
   - Provides specific feedback
   - Rates communication quality

### Cost Optimization

- Cache some fallback questions
- Batch process where possible
- Use lower temperature for consistency

## 🔧 Customization

### Add Custom Questions

Edit `chatbot.js`:
```javascript
getFallbackQuestion(questionNumber) {
  const fallbackQuestions = [
    // Add your custom questions
  ];
}
```

### Modify Scoring Weights

Edit `scoring.js`:
```javascript
// Change weights in calculateFinalScore()
// Adjust thresholds in decision logic
```

### Change Interview Length

Edit `candidates.js`:
```javascript
const maxQuestions = 10; // Change this value
```

## 🚢 Production Deployment

### Backend (Node.js on Azure/Heroku)

**Heroku**:
```bash
heroku login
heroku create your-app-name
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set SUPABASE_URL=...
git push heroku main
```

**Azure Container Apps**:
```bash
az containerapp create \
  --name dd-iot-validator \
  --resource-group your-rg \
  --environment your-env \
  --image your-registry/dd-iot-validator:latest
```

### Frontend (React on Vercel/Netlify)

**Vercel**:
```bash
npm install -g vercel
vercel
# Follow prompts
```

**Netlify**:
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend .
RUN npm install --production
EXPOSE 5000
CMD ["npm", "start"]

# Frontend Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY frontend .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 📈 Monitoring & Analytics

### Logs

Backend logs API calls, errors, and processing times:
```bash
# View logs in development
npm run dev

# Check error patterns
tail -f logs/error.log
```

### Metrics to Track

- Resume processing time
- Question answer evaluation time
- Decision distribution (Selected/Training/Rejected)
- Average scores by question
- AI API costs

## 🔐 Security Considerations

1. **API Keys**: Never commit .env files
2. **CORS**: Restrict to your frontend domain
3. **Rate Limiting**: Already implemented (100 req/min)
4. **File Upload**: Only accept PDF, max 5MB
5. **Database**: Use RLS in production
6. **HTTPS**: Enable in production

## 🚨 Troubleshooting

### "OpenAI API Error"
- Check OPENAI_API_KEY is correct
- Verify API quota and billing
- Check request format in logs

### "Resume Upload Fails"
- Verify PDF is valid and under 5MB
- Check Supabase connection
- Review browser console for errors

### "Interview Hangs"
- Check OpenAI API status
- Verify CORS settings
- Check network requests in DevTools

### "Database Connection Error"
- Verify SUPABASE_URL and SUPABASE_KEY
- Check network connectivity
- Ensure Supabase project is active

## 📚 Project Structure

```
dd-iot-validator/
├── backend/
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities
│   │   ├── config/        # Configuration
│   │   └── index.js       # Server entry
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API client
│   │   ├── hooks/         # Custom hooks & state
│   │   ├── App.jsx        # Main app
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql         # Database schema
└── README.md
```

## 🎯 Next Steps

1. **Setup Supabase account**
2. **Get OpenAI API key**
3. **Install dependencies** (backend & frontend)
4. **Configure .env files**
5. **Run database schema**
6. **Start both servers**
7. **Test workflow** (upload → interview → results)

## 📞 Support

For issues or questions:
- Check logs for error details
- Review API response messages
- Verify all environment variables
- Test with sample data

---

**Happy Recruiting! 🚀**
