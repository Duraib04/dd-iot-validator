# DD IoT Validator - Architecture & Technical Design

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser / Web Client                         │
│                          (React)                                 │
│               ┌─────────────────────────────────┐               │
│               │   Landing Page                  │               │
│               │   Resume Upload                 │               │
│               │   Interview Chat                │               │
│               │   Results Dashboard             │               │
│               └─────────────────────────────────┘               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Server                                │
│                   (Node.js + Express)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Routes                                                │ │
│  │  - /api/candidates/upload                                 │ │
│  │  - /api/candidates/:id/next-question                      │ │
│  │  - /api/candidates/:id/submit-answer                      │ │
│  │  - /api/candidates/:id/finalize                           │ │
│  │  - /api/candidates/:id/results                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Services                                                  │ │
│  │  ├─ Resume Parser (PDF → Text → AI Analysis)             │ │
│  │  ├─ Chatbot (Question Gen → Answer Evaluation)           │ │
│  │  ├─ Scoring (Calculate metrics & decisions)              │ │
│  │  └─ Database (Supabase queries)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  External APIs                                             │ │
│  │  ├─ OpenAI GPT-4 (Resume parsing, chat, evaluation)      │ │
│  │  └─ PDF Parse (PDF text extraction)                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ├─── OpenAI API ──────┐
               │                      ▼
               │            ┌─────────────────┐
               │            │  GPT-4 Model    │
               │            │  - Parsing      │
               │            │  - Q-Gen        │
               │            │  - Evaluation   │
               │            └─────────────────┘
               │
               └─── Supabase PostgreSQL ───┐
                                           ▼
                               ┌─────────────────────────┐
                               │  Database               │
                               │  ├─ candidates          │
                               │  ├─ skills             │
                               │  ├─ interview_questions│
                               │  ├─ interview_answers  │
                               │  ├─ scores             │
                               │  └─ resume_analysis    │
                               └─────────────────────────┘
```

## 🔄 Data Flow

### 1. Resume Upload Flow

```
Candidate Resume (PDF)
        │
        ▼
    PDF Upload
    (multipart/form-data)
        │
        ▼
    Extract Text (pdfparse)
        │
        ▼
    Send to OpenAI
    (Extract skills, projects, tech, IoT relevance)
        │
        ▼
    Parse AI Response
    (JSON extraction)
        │
        ▼
    Store in Database
    ├─ candidates table
    ├─ candidate_skills table
    └─ resume_analysis table
        │
        ▼
    Calculate Resume Scores
    (Hardware, Programming)
        │
        ▼
    Return to Frontend
    (candidateId, analysis, scores)
```

### 2. Interview Flow

```
Get Next Question
        │
        ▼
Generate Question (OpenAI)
- Context: Resume analysis
- Adaptive difficulty
- Based on previous answers
        │
        ▼
Store Question in DB
        │
        ▼
Return to Candidate
        │
        ▼
     Candidate Answers
        │
        ▼
Evaluate Answer (OpenAI)
- Score (0-10)
- Feedback
- Communication rating
- Technical depth score
        │
        ▼
Store Answer & Evaluation
        │
        ▼
Return Evaluation to Candidate
        │
        ├─ Repeat until 10 answers or user quits
        │
        ▼
    Finalize Interview
        │
        ▼
Calculate Final Scores
├─ Hardware (from resume)
├─ Programming (from resume)
├─ Problem-Solving (avg of technical scores)
└─ Communication (avg of communication scores)
        │
        ▼
Make Hiring Decision
├─ Score > 30: SELECTED
├─ 20-30: NEEDS_TRAINING
└─ < 20: REJECTED
        │
        ▼
    Generate Report
        │
        ▼
    Return to Frontend
```

### 3. Results Flow

```
Get Results
    │
    ▼
Retrieve from Database
├─ Candidate summary
├─ Scores breakdown
├─ Resume analysis
└─ Decision & reason
    │
    ▼
Display Dashboard
├─ Total score
├─ Score breakdown charts
├─ Decision badge
├─ Feedback & recommendations
└─ Download option
    │
    ▼
Optional: Print/Download
```

## 📚 Database Schema Overview

### Core Tables

**candidates**
- id (UUID, PK)
- email, full_name
- resume_url, resume_text
- status (in_progress, completed, rejected, selected, training)
- timestamps

**resume_analysis**
- id (UUID, PK)
- candidate_id (FK)
- years_of_experience
- education_level
- technologies (text array)
- iot_relevance_score (0-1)
- strengths, weaknesses
- timestamps

**interview_questions**
- id (UUID, PK)
- candidate_id (FK)
- question_number
- question_text
- type (technical, behavioral)
- difficulty_level (1-10)

**interview_answers**
- id (UUID, PK)
- candidate_id (FK), question_id (FK)
- answer_text
- score (0-10)
- feedback
- timestamps

**candidate_scores**
- id (UUID, PK)
- candidate_id (FK, unique)
- hardware_score, programming_score, problem_solving_score, communication_score
- total_score (generated)
- final_decision, decision_reason
- timestamps

### Indexes for Performance

- candidates (email, status, created_at DESC)
- resume_analysis (candidate_id)
- interview_questions (candidate_id)
- interview_answers (candidate_id, question_id)

## 🎯 Scoring Algorithm Breakdown

### Hardware Knowledge

```javascript
hardware = iotRelevanceScore * 10

Example:
- Resume mentions 5 IoT projects: 5 points
- Experience with Arduino/ESP32: 3 points
- Bachelor's in electrical eng: 2 points
= 10/10
```

### Programming

```javascript
programming = min(
  yearsOfExperience * 0.5 +
  numberOfTechnologies * 0.5 +
  2,
  10
)

Example:
- 8 years experience: 4 points
- 5 technologies: 2.5 points
- Base: 2 points
= 8.5/10
```

### Problem-Solving

```javascript
problemSolving = average(technicalInterviewScores)

Example:
- Q1: 8/10 (System design)
- Q2: 7/10 (Debugging)
- Q3: 9/10 (Architecture)
- Q4: 6/10 (Trade-offs)
= (8+7+9+6)/4 = 7.5/10
```

### Communication

```javascript
communication = average(communicationScores)

Rated across all interview questions:
- Clarity of explanation
- Articulation of ideas
- Engaging presentation

Example average: 7/10
```

## 🔌 API Design Principles

### Request/Response Format

```javascript
// Success Response
{
  success: true,
  statusCode: 200,
  message: "Success message",
  data: { /* payload */ }
}

// Error Response
{
  success: false,
  statusCode: 400,
  message: "Error message",
  errors: ["Detailed error 1", "Detailed error 2"]
}
```

### Error Handling

- Input validation at route level
- Service layer throws specific errors
- Caught and formatted by error middleware
- All errors logged with context

### Rate Limiting

- 100 requests per 60 seconds per IP
- Prevents abuse of OpenAI API
- Returns 429 Too Many Requests

## 🔐 Security Layers

### Input Validation
- Email format validation
- File type/size validation
- Text input sanitization
- UUID validation

### API Security
- CORS restricted to frontend domain
- Rate limiting enabled
- Request logging for audit trail
- Error messages don't leak system details

### Database Security
- RLS (Row Level Security) ready
- Parameterized queries (via ORM)
- No sensitive data in logs
- Timestamps for audit trail

### External API Security
- OpenAI API key in environment
- No API keys in frontend
- Request/response logging
- Timeout protection

## 🧪 Testing Strategy

### Unit Tests
- Score calculation
- Resume parsing logic
- Interview question generation

### Integration Tests
- API endpoint workflows
- Database operations
- OpenAI API mocking

### E2E Tests
- Complete candidate journey
- Resume upload to results
- Browser automation

## 📈 Performance Optimization

### Caching
- Fallback questions cached locally
- Resume analysis cached in DB
- Consider Redis for session data at scale

### Database
- Indexes on frequently queried fields
- Connection pooling
- Query optimization

### API Calls
- Batch operations where possible
- Reuse connections
- Implement exponential backoff

## 🚀 Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Database handles persistence
- Load balancer for multiple instances

### Vertical Scaling
- Optimize AI prompt efficiency
- Cache more results
- Background job processing

### Future Features
- Admin dashboard with analytics
- Bulk candidate import
- Custom evaluation templates
- Integration with ATS systems

---

**Design prepared for production scalability**
