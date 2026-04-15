# ✅ Simplified: Questions from Repo, Not Database

## What Changed

**Before:**
- Questions stored in Supabase database ❌
- Had to add "interview_questions" table
- Required Supabase queries to get questions

**Now:**
- Questions stored in **`frontend/src/data/questions.json`** ✅
- Questions are version controlled in GitHub
- Simple JSON file, no database needed for questions
- Lighter database load

---

## Your New Setup

### Questions (In Repo)
📄 **`frontend/src/data/questions.json`**
```json
[
  {
    "id": "q1",
    "question": "What experience do you have with IoT systems?",
    "type": "technical",
    "difficulty": 1,
    "expectedKeywords": ["IoT", "embedded", "devices"]
  },
  ...10 questions total
]
```

**To add new questions:**
1. Edit [`frontend/src/data/questions.json`](../frontend/src/data/questions.json)
2. Add your question
3. Git push → Auto-deploys to Vercel ✅

### Candidate Data (Still in Supabase)
- ✅ Candidate info (name, email, resume)
- ✅ Candidate answers
- ✅ Candidate scores
- ✅ Interview progress

---

## Simplified Database Schema

**Tables NEEDED in Supabase:**
```sql
candidates                    -- Candidate info + status
resume_analysis              -- Resume parsing results
interview_answers            -- Answers to questions (NOT questions)
candidate_scores             -- Metric scores (hardware, programming, etc)
email_logs                   -- Email notification tracking
```

**Table NOT NEEDED:**
- ~~interview_questions~~ ❌ (Use `frontend/src/data/questions.json` instead)

---

## How It Works Now

### Flow: Get Next Question

**Old Way (Database):**
```
/api/question → Query interview_questions table → Return question
```

**New Way (Repo):**
```
/api/question → Read questions.json → Return question → Log to Supabase
```

### Code

**`/api/question.js`** loads from static JSON:
```javascript
import questions from '../src/data/questions.json' assert { type: 'json' };

// Get next question from static list (rotates)
const questionIndex = (questionNumber - 1) % questions.length;
const questionData = questions[questionIndex];

// Log to Supabase that candidate saw this question (but question itself from JSON)
```

**`/api/answer.js`** evaluates using static question data:
```javascript
// Get question from static list
const question = questions.find(q => q.id === questionId);

// Use expectedKeywords from JSON for evaluation
const response = await openai.chat.completions.create({
  content: `Expected keywords: ${question.expectedKeywords.join(', ')}`
});
```

---

## Benefits

✅ **No database for questions**
- Simpler setup
- No "interview_questions" table needed
- Questions version controlled in Git

✅ **Edit questions easily**
- Edit JSON file
- Git push
- Deployed in seconds

✅ **Save Supabase storage**
- Only store candidate data & scores
- Questions live in repo

✅ **Offline questions work**
- Questions available even if DB is down
- Static content = 100% reliable

---

## Deploy This Change

```bash
cd c:\Users\durai\OneDrive\Documents\projects\COMPANY\profile-validate\dd-iot-validator

# Commit changes
git add frontend/src/data/questions.json
git add frontend/api/question.js
git add frontend/api/answer.js
git commit -m "Use static questions from repo instead of database"
git push

# Auto-deploys to Vercel!
```

---

## MUCH Simpler Setup Now

Instead of:
1. Create Supabase project
2. Run schema.sql (with interview_questions table)
3. Set up questions in database
4. Query questions from API

Now just:
1. Edit `frontend/src/data/questions.json`
2. Push to GitHub
3. Done! ✅

---

## To Add More Questions

**Edit:** `frontend/src/data/questions.json`

```json
{
  "id": "q11",
  "question": "Your new question here?",
  "type": "technical", // or "behavioral"
  "difficulty": 2,
  "expectedKeywords": ["keyword1", "keyword2", "keyword3"]
}
```

Then: `git push` → Deployed! 🚀

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Questions stored in | Supabase DB | `questions.json` in repo |
| Edit questions | Database GUI | Edit JSON file |
| Version control | No | Yes ✅ |
| Deploy changes | Manual schema update | Git push ✅ |
| Database tables | 6 (including interview_questions) | 5 (simpler) |
| Setup complexity | Medium | Simple ✅ |

**You were absolutely right - use the repo for static content!** 🎯
